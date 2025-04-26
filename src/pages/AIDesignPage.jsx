import React, { useState } from "react";

export default function AIDesignPage() {
  const systemPrompt = '請根據以下使用者輸入生成最佳提示：';
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState([]);
  const [imageURL, setImageURL] = useState("");

  // 處理檔案上傳
  const handleFileUpload = (e) => {
    const uploaded = Array.from(e.target.files).map((f) => f.name);
    setFiles((prev) => [...prev, ...uploaded]);
  };

  // 呼叫後端生成圖片
  const handleGenerate = async () => {
    if (!prompt) return;
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, files }),
      });
      const data = await res.json();
      setImageURL(data.image_url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen grid grid-cols-[3fr_2fr_1fr] gap-6 bg-white p-6 text-gray-800">
      {/* 左側：圖片展示，左方區域變寬 */}
      <div className="flex flex-col border-2 border-orange-500 bg-gray-50 rounded-2xl p-4">
        {/* 歷史縮圖：生成後才顯示 */}
        {imageURL && (
          <div className="flex items-center gap-2 mb-4">
            <img
              src={imageURL}
              alt="歷史縮圖"
              className="w-12 h-12 object-cover rounded"
            />
            <span className="ml-auto text-sm text-orange-500">歷史生成記錄</span>
          </div>
        )}
        {/* 主顯示區 */}
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
        {/* 操作按鈕 */}
        <div className="flex justify-around mt-4">
          <button className="p-3 bg-orange-500 text-white rounded-lg">←</button>
          <button
            className="p-3 bg-orange-500 text-white rounded-lg"
            onClick={handleGenerate}
          >
            ↻
          </button>
          <button
            className="p-3 bg-orange-500 text-white rounded-lg"
            onClick={() => setImageURL("")}
          >
            ↓
          </button>
        </div>
      </div>

      {/* 中間：Best Prompt 與輸入，區域變窄 */}
      <div className="flex flex-col border-2 border-blue-500 bg-gray-50 rounded-2xl p-4">
        <div className="mb-4 p-3 bg-blue-500 text-white rounded-lg">
          <strong>Best Prompt:</strong>
          <p className="mt-2 whitespace-pre-wrap">
            {systemPrompt}{prompt || "（尚未輸入）"}
          </p>
        </div>
        <div className="flex-1 bg-white rounded-xl p-4 overflow-auto mb-4">
          <div className="text-blue-500">User: {prompt || "..."}</div>
        </div>
        <div className="flex items-center gap-2">
          <textarea
            placeholder="輸入你的 prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none"
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={handleGenerate}
          >
            → Generate
          </button>
        </div>
      </div>

      {/* 右側：檔案上傳與列表，不變 */}
      <div className="flex flex-col border-2 border-purple-500 bg-gray-50 rounded-2xl p-4">
        <div className="flex-1 overflow-auto space-y-2 mb-4">
          {files.length > 0 ? (
            files.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="checkbox" id={`file-${i}`} className="form-checkbox" />
                <label htmlFor={`file-${i}`}>{f}</label>
              </div>
            ))
          ) : (
            <p className="text-gray-500">尚未上傳任何檔案</p>
          )}
        </div>
        <label className="w-full flex justify-center items-center py-2 bg-purple-500 text-white rounded-lg cursor-pointer">
          上傳檔案
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
import React, { useState } from "react";

export default function AIDesignPage() {
  const systemPrompt = '請根據以下使用者輸入生成最佳提示：';
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState([]);
  const [imageURL, setImageURL] = useState("");

  // 處理檔案上傳
  const handleFileUpload = (e) => {
    const uploaded = Array.from(e.target.files).map((f) => f.name);
    setFiles((prev) => [...prev, ...uploaded]);
  };

  // 呼叫後端生成圖片
  const handleGenerate = async () => {
    if (!prompt) return;
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, files }),
      });
      const data = await res.json();
      setImageURL(data.image_url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen grid grid-cols-[2fr_3fr_1fr] gap-6 bg-white p-6 text-gray-800">
      {/* 左側：圖片展示 */}
      <div className="flex flex-col border-2 border-orange-500 bg-gray-50 rounded-2xl p-4">
        {/* 歷史縮圖：只有生成後才顯示 */}
        {imageURL && (
          <div className="flex items-center gap-2 mb-4">
            <img
              src={imageURL}
              alt="歷史縮圖"
              className="w-12 h-12 object-cover rounded"
            />
            <span className="ml-auto text-sm text-orange-500">歷史生成記錄</span>
          </div>
        )}
        {/* 主顯示區 */}
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
        {/* 操作按鈕 */}
        <div className="flex justify-around mt-4">
          <button className="p-3 bg-orange-500 text-white rounded-lg">←</button>
          <button
            className="p-3 bg-orange-500 text-white rounded-lg"
            onClick={handleGenerate}
          >
            ↻
          </button>
          <button
            className="p-3 bg-orange-500 text-white rounded-lg"
            onClick={() => setImageURL("")}
          >
            ↓
          </button>
        </div>
      </div>

      {/* 中間：Best Prompt 與輸入 */}
      <div className="flex flex-col border-2 border-blue-500 bg-gray-50 rounded-2xl p-4">
        <div className="mb-4 p-3 bg-blue-500 text-white rounded-lg">
          <strong>Best Prompt:</strong>
          <p className="mt-2 whitespace-pre-wrap">
            {systemPrompt}
            {prompt || "（尚未輸入）"}
          </p>
        </div>
        <div className="flex-1 bg-white rounded-xl p-4 overflow-auto mb-4">
          <div className="text-blue-500">User: {prompt || "..."}</div>
        </div>
        <div className="flex items-center gap-2">
          <textarea
            placeholder="輸入你的 prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none"
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={handleGenerate}
          >
            → Generate
          </button>
        </div>
      </div>

      {/* 右側：檔案上傳與列表 */}
      <div className="flex flex-col border-2 border-purple-500 bg-gray-50 rounded-2xl p-4">
        <div className="flex-1 overflow-auto space-y-2 mb-4">
          {files.length > 0 ? (
            files.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="checkbox" id={`file-${i}`} className="form-checkbox" />
                <label htmlFor={`file-${i}`}>{f}</label>
              </div>
            ))
          ) : (
            <p className="text-gray-500">尚未上傳任何檔案</p>
          )}
        </div>
        <label className="w-full flex justify-center items-center py-2 bg-purple-500 text-white rounded-lg cursor-pointer">
          上傳檔案
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
