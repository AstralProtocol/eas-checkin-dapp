"use client";

import { useEffect, useRef, useState } from "react";

export default function PintataUpload() {
  const [file, setFile] = useState("");
  const [cid, setCid] = useState("");
  const [uploading, setUploading] = useState(false);

  const inputFile = useRef<any>(null);
  useEffect(() => {
    console.log("[🧪 DEBUG](file):", file);
    console.log("[🧪 DEBUG](cid):", cid);
    console.log(
      "[🧪 DEBUG](process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/):",
      `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${cid}`,
    );
  }, [cid, file]);
  const uploadFile = async (fileToUpload: string | Blob) => {
    try {
      setUploading(true);
      const data = new FormData();
      data.set("file", fileToUpload);
      const res = await fetch("/api/files", {
        method: "POST",
        body: data,
      });
      const resData = await res.json();
      setCid(resData.IpfsHash);
      setUploading(false);
    } catch (e) {
      console.log(e);
      setUploading(false);
      alert("Trouble uploading file");
    }
  };
  // @ts-expect-error: Let's ignore a compile error like this unreachable code
  const handleChange = e => {
    setFile(e.target.files[0]);
    uploadFile(e.target.files[0]);
  };

  return (
    <main className="w-full min-h-screen m-auto flex flex-col justify-center items-center">
      <input type="file" id="file" ref={inputFile} onChange={handleChange} />
      <button disabled={uploading} onClick={() => inputFile.current?.click()}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </main>
  );
}
