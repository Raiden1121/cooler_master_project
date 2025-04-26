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
  const [selectedFiles, setSelectedFiles] = useState([]);

  const toggleSelect = (fileName) => {
    setSelectedFiles((prev) =>
      prev.includes(fileName) ? prev.filter((n) => n !== fileName) : [...prev, fileName]
    );
  };

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
    const attachments = selectedFiles.map((name) => fileIds[name]).filter(Boolean);

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
    <div className="h-screen grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] gap-4 md:gap-6 bg-white p-4 md:p-6 text-gray-800">

      {/* 左側：歷史圖片與主圖 */}
      <div className="relative flex flex-col border-2 border-orange-500 bg-gray-50 rounded-2xl p-2 md:p-4 overflow-visible order-1 md:order-1">
        {/* 歷史縮圖列 */}
        <div className="flex flex-wrap gap-2 mb-2 md:mb-4 p-2 bg-orange-100 rounded overflow-visible md:overflow-x-auto">
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

        {/* 手機版小圖示按鈕 */}
        <div className="flex gap-2 absolute top-2 right-2 md:hidden z-10">
          <button onClick={() => {/* send */}} className="w-10 h-10 bg-orange-500 text-white rounded-lg flex items-center justify-center">
            <ArrowLeft size={16} />
          </button>
          <button onClick={() => setImageURL("")} className="w-10 h-10 bg-orange-500 text-white rounded-lg flex items-center justify-center">
            <Download size={16} />
          </button>
        </div>

        {/* 主圖 */}
        {imageURL ? (
          <img
            src={imageURL}
            alt="AI 生成設計圖"
            className="rounded-xl max-h-[50vh] md:max-h-[60vh] mx-auto mb-2 md:mb-4 object-contain"
          />
        ) : (
          <div className="flex-1 border-2 border-dashed border-orange-400 rounded-xl flex items-center justify-center text-orange-500 text-2xl md:text-3xl min-h-[40vh] md:min-h-[50vh]">
            Design Picture
          </div>
        )}

        {/* 桌面版大按鈕 */}
        <div className="hidden md:flex justify-around mt-2 md:mt-4">
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
            className="flex-1 px-2 md:px-3 py-1 md:py-2 border border-gray-300 rounded-lg outline-none resize-none text-xs md:text-sm"
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
      <div className="flex flex-col justify-between h-full border-2 border-purple-500 bg-gray-50 rounded-2xl p-2 md:p-4 overflow-hidden order-2 md:order-3 text-sm md:text-base">
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto overflow-y-hidden md:overflow-x-hidden p-2 flex-1">
          {files.length > 0 ? (
            files.map((file, idx) => {
              const fileId = fileIds[file.name];
              const previewSrc = fileId ? `${S3_BASE}${fileId}` : "";
              const isSelected = selectedFiles.includes(file.name);
              return (
                <div key={idx} className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div onClick={() => toggleSelect(file.name)} className="cursor-pointer">
                    {previewSrc ? (
                      <img
                        src={previewSrc}
                        alt={file.name}
                        className={`w-full aspect-square object-contain rounded ${isSelected ? 'filter brightness-75' : ''}`}
                      />
                      
                    ) : (
                      <div className="w-16 h-16 aspect-square bg-gray-200 rounded animate-pulse" />
                    )}
                  </div>
                  <p className="hidden md:block text-xs md:text-sm break-words text-center">{file.name}</p>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center">尚未上傳任何檔案</p>
          )}
        </div>

        {/* 上傳按鈕 */}
        <label className="w-full flex justify-center items-center py-2 bg-purple-500 text-white rounded-lg cursor-pointer mt-2">
          上傳檔案
          <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
        </label>
      </div>
    </div>
  );
}
