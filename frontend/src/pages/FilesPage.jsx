import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const FilesPage = () => {
  const [files, setFiles] = useState([]);
  const [schoolId, setSchoolId] = useState("");
  const [schools, setSchools] = useState([]);

  const { user } = useAuth();

  const fetchFiles = async () => {
    try {
      let url = "/getsubmissions/my";

      // 🎯 staff → all with filter
      if (user?.role === "staff") {
          url += `?schoolId=${schoolId}`;
      }

      const res = await API.get(url);
      setFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.role === "staff") {
      API.get("/getsubmissions/schools")
        .then((res) => setSchools(res.data));
    }
  }, [user]);

  useEffect(() => {
    fetchFiles();
  }, [schoolId]);

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Your Uploaded Files</h1>

      {/* 🎯 STAFF FILTER */}
      {user?.role === "staff" && (
        <select
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
          className="p-2 rounded border"
        >
          <option value="">All Schools</option>
          {schools.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      )}

      {files.length === 0 ? (
        <p className="text-gray-500">No submissions yet</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((item) => (
            <div
              key={item._id}
              className="backdrop-blur-lg bg-white/30 border border-white/20 rounded-2xl p-4 shadow space-y-4"
            >

              <div>
                <h2 className="font-semibold">{item.taskType}</h2>

                {user?.role === "staff" && item.schoolId && (
                  <p className="text-sm text-gray-600">
                    School: {item.schoolId.name}
                  </p>
                )}

                {user?.role === "staff" && (
                  <p className="text-sm text-gray-600">
                    Message: {item.message || "No message"}
                  </p>
                )}

              </div>

              {/* Uploaded */}
              <div>
                <p className="text-sm font-medium mb-1">Uploaded Files</p>
                <div className="flex flex-wrap gap-2">
                  {item.files.map((file, i) => (
                    <a
                      key={i}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      File {i + 1}
                    </a>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default FilesPage;