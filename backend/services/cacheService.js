import crypto from "crypto";

export const generateHash = (files) => {
  const data = files.map(f => f.url).join("|");
  return crypto.createHash("md5").update(data).digest("hex");
};

export const isCached = (submission, currentHash) => {
  return submission.lastProcessedHash === currentHash;
};