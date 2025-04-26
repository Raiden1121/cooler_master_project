import React, { useState } from "react";
import { ArrowLeft, Download, RotateCcw } from "lucide-react";

const API_BASE = "https://5jcxcx8tub.execute-api.us-west-2.amazonaws.com";
const S3_BASE = "https://s3.us-west-2.amazonaws.com/generate.imagenfile/uploads";

export default function AIDesignPage() {
  const [prompt, setPrompt] = useState(""); 
  const [bestPrompt, setBestPrompt] = useState(""); 
  const [files, setFiles] = useState([]); 
  const [fileIds, setFileIds] = useState({}); 
  const [imageURL, setImageURL] = useState(""); 
  const [history, setHistory] = useState([]); 
  const [messages, setMessages] = useState([]); 

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
          image_base64: base64.split(",")[1],
        }),
      });
      const { fileId } = await res.json();
      setFileIds((prev) => ({ ...prev, [file.name]: fileId }));
    }
  };

  const handleGenerate = async (customPrompt) => {
    const usedPrompt = customPrompt ?? prompt;
    if (!usedPrompt.trim()) return;

    setMessages((prev) => [...prev, usedPrompt]);
    const checked = files.filter((_, idx) =>
      document.getElementById(`file-${idx}`).checked
    );
    const attachments = checked.map((f) => fileIds[f.name]).filter(Boolean);

    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: usedPrompt,
          images: attachments,
        }),
      });
      const { imageUrl, bestPrompt: generatedBestPrompt } = await res.json();
      setImageURL(imageUrl);
      if (generatedBestPrompt) setBestPrompt(generatedBestPrompt);
      setHistory((prev) => [imageUrl, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] gap-4 md:gap-6 bg-white p-4 md:p-6 text-gray-800 overflow-hidden">
      
      {/* 左側：歷史圖片與主圖 */}
      <div className="flex flex-col border-2 border-orange-500 bg-gray-50 rounded-2xl p-2 md:p-4 overflow-hidden order-1 md:order-1">
        {/* 歷史縮圖列 */}
        <div className="flex gap-2 mb-2 md:mb-4 p-2 bg-orange-100 rounded overflow-x-auto">
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
            <span className="text-xs md:text-sm text-orange-500">尚無歷史檔案</span>
          )}
        </div>

        {/* 主圖 */}
        {imageURL ? (
          <img
            src={imageURL}
            alt="AI 生成設計圖"
            className="rounded-xl max-h-[70vh] md:max-h-[60vh] mx-auto mb-2 md:mb-4 object-contain"
          />
        ) : (
          <div className="flex-1 border-2 border-dashed border-orange-400 rounded-xl flex items-center justify-center text-orange-500 text-xl md:text-2xl">
            Design Picture
          </div>
        )}

        {/* 傳送與下載 */}
        <div className="flex justify-around mt-2 md:mt-4">
          <button className="w-28 md:w-40 h-10 md:h-12 flex items-center justify-center gap-2 bg-orange-500 text-white rounded-lg text-base md:text-lg">
            <ArrowLeft size={20} /> 傳送
          </button>
          <button
            className="w-28 md:w-40 h-10 md:h-12 flex items-center justify-center gap-2 bg-orange-500 text-white rounded-lg text-base md:text-lg"
            onClick={() => setImageURL("")}
          >
            <Download size={20} /> 下載
          </button>
        </div>
      </div>

      {/* 中間：Best Prompt 與 Prompt 輸入 */}
      <div className="flex flex-col border-2 border-blue-500 bg-gray-50 rounded-2xl p-2 md:p-4 overflow-hidden order-3 md:order-2 text-sm md:text-base">
        
        {/* Best Prompt 顯示 */}
        <div className="p-2 md:p-3 bg-blue-500 text-white rounded-lg">
          <strong>Best Prompt:</strong>
          {bestPrompt && <p className="mt-2 whitespace-pre-wrap">{bestPrompt}</p>}
        </div>

        {/* 使用者輸入歷史 */}
        <div className="flex-1 bg-white rounded-xl p-2 md:p-4 mt-2 md:mt-4 overflow-y-auto space-y-2">
          {messages.map((msg, idx) => (
            <div key={idx} className="text-blue-500 break-words">
              User: {msg}
            </div>
          ))}
        </div>

        {/* Prompt 輸入區 */}
        <div className="flex items-center gap-2 mt-2 md:mt-4">
          <textarea
            placeholder="輸入你的 prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const currentPrompt = prompt;
                handleGenerate(currentPrompt);
                setPrompt("");
              }
            }}
            className="flex-1 px-2 md:px-3 py-2 border border-gray-300 rounded-lg outline-none resize-none text-sm md:text-base"
          />

          {/* 按鈕判斷 */}
          {(!prompt.trim() && bestPrompt) ? (
            <button
              className="px-3 md:px-4 py-2 bg-blue-500 text-white rounded-lg"
              onClick={() => handleGenerate(bestPrompt)}
            >
              <RotateCcw size={20} />
            </button>
          ) : (
            <button
              className="px-3 md:px-4 py-2 bg-blue-500 text-white rounded-lg"
              onClick={() => handleGenerate()}
            >
              → Generate
            </button>
          )}
        </div>
      </div>

      {/* 右側：上傳圖片區 */}
      <div className="flex flex-col border-2 border-purple-500 bg-gray-50 rounded-2xl p-2 md:p-4 overflow-hidden order-2 md:order-3 text-sm md:text-base">
        <div className="flex-1 overflow-y-auto space-y-4">
          {files.length > 0 ? (
            files.map((file, idx) => {
              const fileId = fileIds[file.name];
              const previewSrc = fileId ? `${S3_BASE}/${fileId}.jpg` : "";
              return (
                <div key={idx} className="flex items-center gap-2 w-full">
                  <input type="checkbox" id={`file-${idx}`} className="form-checkbox" />
                  <div className="flex flex-col items-center w-full">
                    {previewSrc ? (
                      <img
                        src={previewSrc}
                        alt={file.name}
                        className="w-full max-w-[150px] md:max-w-[200px] aspect-square object-cover rounded"
                      />
                    ) : (
                      <div className="w-full max-w-[150px] md:max-w-[200px] aspect-square bg-gray-200 rounded animate-pulse" />
                    )}
                    <label htmlFor={`file-${idx}`} className="text-xs md:text-sm mt-0.5 break-words text-center">
                      {file.name}
                    </label>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center">尚未上傳任何檔案</p>
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
