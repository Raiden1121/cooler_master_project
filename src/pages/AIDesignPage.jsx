import React, { useState } from "react";
import { ArrowLeft, Download, RotateCcw } from "lucide-react";
import { getUrl } from '@aws-amplify/storage'; // 注意這邊要 @aws-amplify

const API_BASE = "https://5jcxcx8tub.execute-api.us-west-2.amazonaws.com";

const fetchImageUrl = async (imagePath) => {
  try {
    const { url } = await getUrl({ path: imagePath });
    return url;
  } catch (error) {
    console.error('Error fetching image URL:', error);
    return "";
  }
};

export default function AIDesignPage() {
  const [prompt, setPrompt] = useState("");
  const [bestPrompt, setBestPrompt] = useState("");
  const [files, setFiles] = useState([]);
  const [fileIds, setFileIds] = useState({});
  const [fileUrls, setFileUrls] = useState({});
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

      // 這邊 fetch 真正可以看的圖片網址
      const realUrl = await fetchImageUrl(`uploads/${fileId}.jpg`);
      setFileUrls((prev) => ({ ...prev, [file.name]: realUrl }));
    }
  };

  const handleGenerate = async (customPrompt) => {
    const usedPrompt = customPrompt ?? prompt;
    if (!usedPrompt.trim()) return;

    setMessages((prev) => [...prev, usedPrompt]);
    setPrompt("");

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

      // 這邊也要 fetch 真正看的 URL
      const realImageUrl = await fetchImageUrl(`uploads/${imageUrl}`);
      setImageURL(realImageUrl);
      if (generatedBestPrompt) setBestPrompt(generatedBestPrompt);
      setHistory((prev) => [realImageUrl, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] gap-4 md:gap-6 bg-white p-4 md:p-6 text-gray-800">
      
      {/* 左側主圖＋歷史 */}
      <div className="relative flex flex-col border-2 border-orange-500 bg-gray-50 rounded-2xl p-2 md:p-4 overflow-visible order-1 md:order-1">
        {/* 歷史 */}
        <div className="flex flex-wrap gap-2 mb-2 md:mb-4 p-2 bg-orange-100 rounded overflow-x-auto">
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
            className="rounded-xl max-h-[50vh] md:max-h-[60vh] mx-auto mb-2 md:mb-4 object-contain"
          />
        ) : (
          <div className="flex-1 border-2 border-dashed border-orange-400 rounded-xl flex items-center justify-center text-orange-500 text-2xl md:text-3xl min-h-[40vh] md:min-h-[50vh]">
            Design Picture
          </div>
        )}
      </div>

      {/* 中間 Best Prompt＋Prompt輸入 */}
      <div className="flex flex-col border-2 border-blue-500 bg-gray-50 rounded-2xl p-2 md:p-4 overflow-hidden order-3 md:order-2 text-sm md:text-base">
        <div className="p-2 md:p-3 bg-blue-500 text-white rounded-lg">
          <strong>Best Prompt:</strong>
          {bestPrompt && <p className="mt-2 whitespace-pre-wrap">{bestPrompt}</p>}
        </div>

        <div className="flex-1 bg-white rounded-xl p-2 md:p-4 mt-2 md:mt-4 overflow-y-auto space-y-2">
          {messages.map((msg, idx) => (
            <div key={idx} className="text-blue-500 break-words">
              User: {msg}
            </div>
          ))}
        </div>

        {/* Prompt 輸入 */}
        <div className="flex items-center gap-2 mt-2 md:mt-4">
          <textarea
            placeholder="輸入你的 prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleGenerate(prompt);
                setPrompt("");
              }
            }}
            className="flex-1 px-2 md:px-3 py-1 md:py-2 border border-gray-300 rounded-lg outline-none resize-none text-xs md:text-sm"
          />
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

      {/* 右側上傳圖片 */}
      <div className="flex flex-col justify-between h-full border-2 border-purple-500 bg-gray-50 rounded-2xl p-2 md:p-4 overflow-hidden order-2 md:order-3 text-sm md:text-base">
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto p-2 flex-1">
          {files.length > 0 ? (
            files.map((file, idx) => {
              const previewSrc = fileUrls[file.name] || "";
              const isSelected = selectedFiles.includes(file.name);
              return (
                <div key={idx} className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div onClick={() => toggleSelect(file.name)} className="cursor-pointer">
                    {previewSrc ? (
                      <img
                        src={previewSrc}
                        alt={file.name}
                        className={`w-16 h-16 aspect-square object-cover rounded ${isSelected ? 'brightness-75' : ''}`}
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

        <label className="w-full flex justify-center items-center py-2 bg-purple-500 text-white rounded-lg cursor-pointer mt-2">
          上傳檔案
          <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
        </label>
      </div>
    </div>
  );
}
