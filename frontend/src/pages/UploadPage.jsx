import { useState } from "react";
import Upload from "../components/upload/Upload";

const UploadPage = () => {
  const [submissionId, setSubmissionId] = useState(null);

  return (
    <div className="space-y-4">

      <h1 className="text-xl font-bold">Upload Files</h1>

      <Upload setSubmissionId={setSubmissionId} />

    </div>
  );
};

export default UploadPage;