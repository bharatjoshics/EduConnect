import Usage from "../models/Usage.js";

export const saveUsage = async (data, userId = "guest") => {
  try {
    if (!data?.usage) return;

    const usage = data.usage;

    await Usage.create({
      userId,
      model: data.model,
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      cost: usage.cost
    });

  } catch (err) {
    console.log("Cost Save Error:", err.message);
  }
};