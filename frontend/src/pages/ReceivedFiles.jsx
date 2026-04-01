import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const ReceivedFiles = () => {
  const [files, setFiles] = useState([]);
  const [schoolId, setSchoolId] = useState("");
  const [schools, setSchools] = useState([]);
  const [loadingExcelId, setLoadingExcelId] = useState(null);
  const [loadingPDFId, setLoadingPDFId] = useState(null);

  const { user } = useAuth();

  const fetchFiles = async () => {
    try {
      let url = "/getsubmissions/received";

      // 🎯 staff filter
      if (user?.role === "staff" && schoolId) {
        url += `?schoolId=${schoolId}`;
      }

      const res = await API.get(url);
      setFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertExcel = async (id) => {
    try {
      setLoadingExcelId(id);

      const res = await API.get(`/excel/${id}`, {
        responseType: "blob", // important
      });

      // create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "response.xlsx");
      document.body.appendChild(link);
      link.click();

      link.remove();
      setLoadingExcelId(null);

    } catch (err) {
      console.error(err);
      setLoadingExcelId(null);
    }
  };

  const handleConvertPDF = async (id) => {
    try {
      setLoadingPDFId(id);

      const res = await API.get(`/pdf/${id}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "document.pdf");
      document.body.appendChild(link);
      link.click();

      link.remove();
      setLoadingPDFId(null);

    } catch (err) {
      console.error(err);
      setLoadingPDFId(null);
    }
  };

  useEffect(() => {
    if (user?.role === "staff") {
      API.get("/getsubmissions/schools")
        .then((res) => setSchools(res.data));
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [schoolId]);

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Received Files</h1>

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
        <p className="text-gray-500">No files received yet</p>
      ) : (
        files.map((item) => (
          <div
            key={item._id}
            className="backdrop-blur-lg bg-white/30 border border-white/20 rounded-2xl p-4 shadow space-y-4"
          >

            <div>
              <h2 className="font-semibold">{item.taskType}</h2>

              {/* 👇 school name for staff */}
              {user?.role === "staff" && item.schoolId && (
                <p className="text-sm text-gray-600">
                  School: {item.schoolId.name}
                </p>
              )}
              
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Files</p>

              <div className="flex flex-wrap gap-3 mb-1">
                {item.files?.map((file, i) => {
                  const isImage = file.url.match(/\.(jpeg|jpg|png)$/i);
                  const isPDF = file.url.match(/\.pdf$/i);

                  return (
                    <div key={i} className="space-y-2">

                      {/* PREVIEW */}
                      {isImage && (
                        <img
                          src={file.url}
                          alt="preview"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      )}

                      {isPDF && (
                        <iframe
                          src={file.url}
                          title="pdf-preview"
                          className="w-32 h-32 rounded-lg border"
                        />
                      )}

                      {/*MSG*/}
                      {user?.role === "school" && (
                        <p className="text-sm text-gray-600">
                          Message: {item.message || "No message"}
                        </p>
                      )}

                      {/* ACTIONS */}
                      <div className="flex flex-col gap-1">

                        {/* ✅ ALL USERS */}
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm text-center"
                        >
                          Download Original
                        </a>

                      </div>

                    </div>
                  );
                })}
              </div>

              {user?.role === "staff" && (
                <>
                  {/* EXCEL */}
                  {item.excelFile ? (
                    <a
                      href={item.excelFile}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm text-center"
                    >
                      Download Excel
                    </a>
                  ) : (
                    <button
                      onClick={() => handleConvertExcel(item._id)}
                      disabled={loadingExcelId === item._id}
                      className={`px-3 py-1 rounded-lg text-sm text-white ${loadingExcelId === item._id ? "bg-gray-400 cursor-not-allowed" : "bg-green-500" }`}
                    >
                      {loadingExcelId === item._id ? "Processing..." : "Convert → Excel (AI)"}
                    </button>
                  )}
                  
                  {/* PDF */}
                  {item.pdfFile ? (
                    <a
                      href={item.pdfFile}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm text-center"
                    >
                      Download PDF
                    </a>
                  ) : (
                    <button
                      onClick={() => handleConvertPDF(item._id)}
                      disabled={loadingPDFId === item._id}
                      className={`px-3 py-1 rounded-lg text-sm text-white ${loadingPDFId === item._id ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 ml-1" }`}
                    >
                      {loadingPDFId === item._id ? "Processing..." : "Convert → PDF"}
                    </button>
                  )}
                </>
              )}
            </div>

          </div>
      ))
    )}

  </div>
);
};

export default ReceivedFiles;