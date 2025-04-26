import React, { useState } from "react";
import { ArrowLeft, Download, RotateCcw } from "lucide-react";

const API_BASE = "https://jetcaa3x74.execute-api.us-west-2.amazonaws.com/prod";

export default function AIDesignPage() {
  // 狀態管理
  const [prompt, setPrompt] = useState(""); // 使用者輸入的 prompt
  const [bestPrompt, setBestPrompt] = useState(""); // 後端回傳的最佳提示
  const [files, setFiles] = useState([]); // 上傳的檔案列表
  const [fileUrls, setFileUrls] = useState({}); // 上傳後得到的檔案 URL
  const [imageURL, setImageURL] = useState(""); // 最新生成的圖片 URL
  const [history, setHistory] = useState([]); // 歷史生成圖片列表
  const [messages, setMessages] = useState([]); // 使用者送出的 prompt 紀錄

  // 處理檔案上傳
  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...uploadedFiles]);

    for (const file of uploadedFiles) {
      const base64 = await new Promise((resolve) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.readAsDataURL(file);
      });
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentBase64: base64.split(",")[1],
        }),
      });
      const { fileUrl } = await res.json();
      setFileUrls((prev) => ({ ...prev, [file.name]: fileUrl }));
    }
  };

  // 處理送出生成圖片
  const handleGenerate = async (customPrompt) => {
    const usedPrompt = customPrompt ?? prompt;
    if (!usedPrompt.trim()) return;

    setMessages((prev) => [...prev, usedPrompt]);
    setPrompt(""); // 送出後同步清空 textarea

    const checked = files.filter((_, idx) =>
      document.getElementById(`file-${idx}`).checked
    );
    const attachments = checked.map((f) => fileUrls[f.name]).filter(Boolean);

    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: usedPrompt, images: attachments }),
      });
      const { imageUrl, bestPrompt: generatedBestPrompt } = await res.json();
      setImageURL(imageUrl);
      setBestPrompt(generatedBestPrompt);
      setHistory((prev) => [imageUrl, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  // 呼叫重新生成圖片
  const handleResend = async () => {
    try {
      const res = await fetch(`${API_BASE}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const { imageUrl } = await res.json();
      setImageURL(imageUrl);
      setHistory((prev) => [imageUrl, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen grid grid-cols-[3fr_2fr_1fr] gap-6 bg-white p-6 text-gray-800 overflow-hidden">
      {/* 左側：歷史紀錄 + 最新圖片顯示 */}
      <div className="flex flex-col border-2 border-orange-500 bg-gray-50 rounded-2xl p-4 overflow-hidden">
        <div className="flex gap-2 mb-4 p-2 bg-orange-100 rounded overflow-x-auto">
          {history.length > 0 ? (
            history.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`歷史${idx + 1}`}
                className="w-8 h-8 object-cover rounded cursor-pointer"
                onClick={() => setImageURL(url)}
              />
            ))
          ) : (
            <span className="text-sm text-orange-500">尚無歷史檔案</span>
          )}
        </div>

        {imageURL ? (
          <img
            src={imageURL}
            alt="AI 生成設計圖"
            className="rounded-xl max-h-[60vh] mx-auto mb-4 object-contain"
          />
        ) : (
          <div className="flex-1 border-2 border-dashed border-orange-400 rounded-xl flex items-center justify-center text-orange-500 text-2xl">
            Design Picture
          </div>
        )}

        <div className="flex justify-around mt-4">
          <button className="w-40 h-12 flex items-center justify-center gap-2 bg-orange-500 text-white rounded-lg text-lg">
            <ArrowLeft size={20} /> 傳送
          </button>
          <button className="w-40 h-12 flex items-center justify-center gap-2 bg-orange-500 text-white rounded-lg text-lg" onClick={() => setImageURL("")}> 
            <Download size={20} /> 下載
          </button>
        </div>
      </div>

      {/* 中間：Best Prompt 與 Prompt 輸入區 */}
      <div className="flex flex-col border-2 border-blue-500 bg-gray-50 rounded-2xl p-4 overflow-hidden">
        <div className="p-3 bg-blue-500 text-white rounded-lg">
          <strong>Best Prompt:</strong>
          {bestPrompt && <p className="mt-2 whitespace-pre-wrap">{bestPrompt}</p>}
        </div>

        <div className="flex-1 bg-white rounded-xl p-4 mt-4 overflow-y-auto space-y-2">
          {messages.map((msg, idx) => (
            <div key={idx} className="text-blue-500 break-words">
              User: {msg}
            </div>
          ))}
        </div>

        {/* 輸入區，支援 Enter 自動送出且清空 */}
        <div className="flex items-center gap-2 mt-4">
          <textarea
            placeholder="輸入你的 prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const currentPrompt = prompt;
                handleGenerate(currentPrompt); // 送出並在 handleGenerate 清空
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none resize-none"
          />
          {!bestPrompt ? (
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={() => handleGenerate()}>
              → Generate
            </button>
          ) : prompt.trim() ? (
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={() => handleGenerate()}>
              → Generate
            </button>
          ) : (
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={handleResend}>
              <RotateCcw size={20} />
            </button>
          )}
        </div>
      </div>

      {/* 右側：上傳區 */}
      <div className="flex flex-col border-2 border-purple-500 bg-gray-50 rounded-2xl p-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-6">
          {files.length > 0 ? (
            files.map((file, idx) => {
              const previewURL = URL.createObjectURL(file);
              return (
                <div key={idx} className="flex items-center gap-4 w-full">
                  <input type="checkbox" id={`file-${idx}`} className="form-checkbox" />
                  <div className="flex flex-col items-center w-full">
                    <img
                      src={previewURL}
                      alt={file.name}
                      className="w-full max-w-[200px] aspect-square object-cover rounded"
                    />
                    <label htmlFor={`file-${idx}`} className="text-sm mt-0.5 break-words text-center">
                      {file.name}
                    </label>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">尚未上傳任何檔案</p>
          )}
        </div>

        {/* 上傳按鈕 */}
        <label className="w-full flex justify-center items-center py-2 mt-2 bg-purple-500 text-white rounded-lg cursor-pointer">
          上傳檔案
          <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
        </label>
      </div>
    </div>
  );
}
