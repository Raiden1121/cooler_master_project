import React, { useState, useRef, useEffect } from "react";
import { Download, RotateCcw } from "lucide-react";

const API_BASE = "https://5jcxcx8tub.execute-api.us-west-2.amazonaws.com";
const S3_BASE = "https://d2rxbimzcpor6e.cloudfront.net";
const S3_BASE2 = "https://d1ykefiqcz1tgb.cloudfront.net";


export default function AIDesignPage() {
  const [prompt, setPrompt] = useState("");
  const [bestPrompt, setBestPrompt] = useState("");
  const [files, setFiles] = useState([]);
  const [fileIds, setFileIds] = useState({});
  const [imageURL, setImageURL] = useState("");
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (history.length > 0) setSelectedHistory(0);
  }, [history]);

  const toggleSelect = (fileName) => {
    setSelectedFiles((prev) =>
      prev.includes(fileName) ? prev.filter((n) => n !== fileName) : [...prev, fileName]
    );
  };

  const handleFileUpload = async (e) => {
    const uploaded = Array.from(e.target.files);
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...uploaded.filter((f) => !existing.has(f.name))];
    });

    for (const file of uploaded) {
      if (fileIds[file.name]) continue;
      const base64 = await new Promise((res) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.readAsDataURL(file);
      });
      const resp = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          image_base64: base64.split(",")[1],
        }),
      });
      const data = await resp.json();
      const fileId = data.fileId ?? data.result?.fileId;
      if (!fileId) {
        console.error('No fileId returned', data);
        continue;
      }
      setFileIds((p) => ({ ...p, [file.name]: fileId }));
    }
  };

  const handleGenerate = async (usePrompt) => {
    const text = usePrompt ?? prompt;
    if (!text.trim()) return;
    setMessages((p) => [...p, text]);
    setLoading(true);

    const ids = selectedFiles.map((name) => fileIds[name]).filter(Boolean);

    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, fileIds: ids }),
      });
      const data = await res.json();
      const imageId = data.imageId ?? data.result?.imageId;
      let bpData = data.bestPrompt ?? data.result?.bestPrompt;

      if (typeof bpData === "object" && bpData.result) {
        bpData = bpData.result;
      }
      if (typeof bpData === "string") {
        bpData = bpData.replace(/^<generate-best-prompt>\s*/i, "").trim();
      }

      const url = imageId ? `${S3_BASE}/${imageId}.jpg` : "";
      setImageURL(url);
      if (bpData) setBestPrompt(bpData);
      setHistory((p) => [url, ...p]);
    } catch (err) {
      console.error("Generate 錯誤：", err);
    } finally {
      setSelectedFiles([]);
      setLoading(false);
    }
  };

  const handleClickGenerate = () => {
    const cur = prompt;
    setPrompt("");
    handleGenerate(cur);
  };

  const handleDownloadMain = () => {
    if (!imageURL) return;
    const a = document.createElement("a");
    a.href = imageURL;
    a.download = imageURL.split("/").pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] gap-4 p-4 bg-white text-gray-800">

      {/* 左側：歷史縮圖 + 主圖 */}
      <div className="flex flex-col border-2 border-orange-500 bg-gray-50 rounded-2xl p-4">
        <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto">
          {history.length > 0 ? history.map((url, idx) => {
            const active = selectedHistory === idx;
            const src1 = fid ? `${S3_BASE2}/${fid}.jpg` : "";
            return (
              <img 
                src={src1} 
                alt={'歷史${idx + 1}'} 
                className="w-20 h-20 object-cover rounded cursor-pointer transition-transform duration-200 hover:scale-105 ${active ? "border-4 border-orange-500" : "border-2 border-transparent"}" 
                onClick={() => { setImageURL(url); setSelectedHistory(idx); }}
                />
              
  
            );
          }) : <span className="text-xs text-orange-500">尚無歷史檔案</span>}
        </div>

        {loading ? (
          <div className="flex-1 border-2 border-dashed border-orange-400 rounded-xl flex items-center justify-center text-orange-500 text-4xl">生成中...</div>
        ) : imageURL ? (
          <img
            src={src1}
            alt="AI 生成設計圖"
            className="rounded-xl w-full h-auto mb-4 object-contain"
          />
        ) : (
          <div className="flex-1 border-2 border-dashed border-orange-400 rounded-xl flex items-center justify-center text-orange-500 text-4xl">Design Picture</div>
        )}

        <div className="hidden md:flex justify-around mt-4">
          <button onClick={handleDownloadMain} className="w-28 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center gap-2">
            <Download size={20} /> 下載
          </button>
        </div>
      </div>

      {/* 中間：Best Prompt + 聊天 + 輸入 */}
      <div className="flex flex-col border-2 border-blue-500 bg-gray-50 rounded-2xl p-4">
        <div className="p-2 bg-blue-500 text-white rounded-lg">
          <strong>Best Prompt:</strong>
          {bestPrompt && (
            <p className="mt-2 text-sm whitespace-pre-wrap">{bestPrompt}</p>
          )}
        </div>

        <div className="flex-1 flex flex-col bg-white rounded-xl p-4 mt-4">
          <div className="flex-1 overflow-y-auto space-y-2">
            {messages.map((msg, idx) => (
              <div key={idx} className="text-blue-500 break-words">User: {msg}</div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center gap-2 pt-2 mt-2 border-t border-gray-300">
            <textarea
              placeholder="輸入你的 prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.isComposing) return;
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleClickGenerate();
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none text-sm"
            />
            {(!prompt.trim() && bestPrompt) ? (
              <button onClick={() => handleGenerate(bestPrompt)} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                <RotateCcw size={20} />
              </button>
            ) : (
              <button onClick={handleClickGenerate} className="px-4 py-2 bg-blue-500 text-white rounded-lg">→</button>
            )}
          </div>
        </div>
      </div>

      {/* 右側：檔案上傳 & 列表 */}
      <div className="flex flex-col border-2 border-purple-500 bg-gray-50 rounded-2xl p-4 overflow-hidden">
        <div className="flex flex-row md:flex-col gap-2 overflow-auto mb-4">
          {files.map((file, idx) => {
            const fid = fileIds[file.name];
            const src = fid ? `${S3_BASE}/${fid}.jpg` : "";
            const sel = selectedFiles.includes(file.name);
            return (
              <div key={idx} onClick={() => toggleSelect(file.name)} className="flex-shrink-0 w-20 md:w-full">
                <div className={`aspect-square rounded overflow-hidden border-2 ${sel ? "border-purple-500" : "border-transparent"}`}>
                  {src ? <img src={src} alt={file.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 animate-pulse" />}
                </div>
                <p className="hidden md:block text-xs text-center mt-1">{file.name}</p>
              </div>
            );
          })}
        </div>
        <label className="mt-auto py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-center cursor-pointer">
          上傳檔案
          <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

    </div>
  );
}
