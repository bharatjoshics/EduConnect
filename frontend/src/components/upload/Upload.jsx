import { useEffect, useState } from "react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const Upload = ({ setSubmissionId }) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [taskType, setTaskType] = useState("");
  const [loading, setLoading] = useState(false);
  const [schoolId, setSchoolId] = useState("");
  const [msg, setMsg] = useState("");
  const [schools, setSchools] = useState([]);

  const { user } = useAuth();

  useEffect(()=>{
    if(user.role === "staff"){
      API.get("/getsubmissions/schools")
        .then(res=>setSchools(res.data))
        .catch(err=>console.error(err));
    }
  },[]);

  

  // 📸 Handle file selection + preview
  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length > 10){
      alert("Max 10 files allowed at once");
      return;
    }
    setFiles(selectedFiles);

    const previewUrls = selectedFiles.map(file =>
      URL.createObjectURL(file)
    );

    setPreviews(previewUrls);
  };

  // ❌ Remove file
  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  // 🚀 Upload
  const handleUpload = async () => {
    if (!files.length || !taskType) {
      alert("Select files and task type");
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    formData.append("taskType", taskType);

    if(user.role === "staff"){
      if(!schoolId){
        alert("Please Enter School ID");
        return;
      }
      formData.append("schoolId", schoolId);
      formData.append("message", msg);
    }

    try {
      setLoading(true);

      const res = await API.post("/submissions/create", formData);

      setSubmissionId(res.data._id);

      // ✅ clear after upload
      setFiles([]);
      setPreviews([]);
      setSchoolId("");
      setMsg("");

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-lg bg-white/30 border border-white/20 shadow-xl rounded-2xl p-6 w-full max-w-xl mx-auto">

      <h2 className="text-xl font-semibold mb-4">Upload Files</h2>

      {/* Select School */}
      {user.role === "staff" && (
        <select
          className="w-full mb-4 p-2 rounded-lg"
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
        >
          <option value="">Select School</option>
          {schools.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      )}

      {/* Enter MSG */}
      {user.role === "staff" && (
        <input
          type="text"
          className="w-full mb-4 p-2 rounded-lg"
          placeholder="Message"
          value={msg}
          required
          onChange={(e) => setMsg(e.target.value)}
        />
      )}

      {/* Task Dropdown */}
      <select
        value={taskType}
        onChange={(e) => setTaskType(e.target.value)}
        className="w-full mb-4 p-2 rounded-lg"
      >
        <option value="">Select Task</option>
        <option value="Result">Result</option>
        <option value="Registration">Registration</option>
        <option value="Modification">Modification</option>
      </select>

      {/* File Input */}
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFiles}
        className="mb-4 w-full border p-2 rounded-lg"
      />

      {/* 🖼️ Preview Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {previews.map((src, index) => (
            <div key={index} className="relative group">

              <img
                src={src}
                alt="preview"
                className="w-full h-32 object-cover rounded-xl"
              />

              {/* ❌ Remove button */}
              <button
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>

            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={loading}
        className="w-full bg-blue-600/80 backdrop-blur text-white py-2 rounded-xl hover:bg-blue-700 transition disabled:bg-gray-400"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default Upload;