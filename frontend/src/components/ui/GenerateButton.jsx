import { useState } from "react";
import API from "../../services/api";

const GenerateButton = ({ submissionId }) => {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);

      const res = await API.get(`/excel/${submissionId}`, {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "result.xlsx");
      document.body.appendChild(link);
      link.click();

    } catch (err) {
      console.error(err);
      alert("Failed to generate Excel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="mt-6 w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition disabled:bg-gray-400"
    >
      {loading ? "Generating..." : "Generate & Download Excel"}
    </button>
  );
};

export default GenerateButton;