const axios = require("axios");

const AppError = require("../utils/AppError");

/*
====================================================
SMALL SHARED CLAUDE CLIENT
One place that knows how to call the Claude Messages
API, so features only supply a prompt.
====================================================
*/

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

// Override with ANTHROPIC_MODEL in .env without touching code.
const DEFAULT_MODEL = "claude-sonnet-5-5";

const getModel = () => process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

const unexpectedAnswer = () =>
  new AppError(
    "The AI returned an unexpected answer. Please try again.",
    502
  );

/*
 * Sends one prompt and returns the model's text reply.
 */
const askClaude = async ({ system, user, maxTokens = 1200 }) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new AppError(
      "The AI assistant is not configured on this server.",
      503
    );
  }

  let response;

  try {
    response = await axios.post(
      ANTHROPIC_URL,
      {
        model: getModel(),
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
      },
      {
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": ANTHROPIC_VERSION,
          "content-type": "application/json",
        },
        timeout: 45000,
      }
    );
  } catch (error) {
    // Log the real reason for you, show the user a safe message.
    console.error(
      "Claude request failed:",
      error.response?.status,
      error.response?.data?.error?.message || error.message
    );

    const status = error.response?.status;

    if (status === 401 || status === 403 || status === 404) {
      throw new AppError(
        "The AI assistant is not configured correctly on this server.",
        503
      );
    }

    throw new AppError(
      "The AI assistant is busy right now. Please try again in a minute.",
      503
    );
  }

  return (response.data?.content || [])
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
};

/*
 * Finds the JSON object in the model's reply, even if it
 * wrapped it in ```json fences or added a stray sentence.
 */
const extractJson = (text) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end <= start) throw unexpectedAnswer();

  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    throw unexpectedAnswer();
  }
};

module.exports = {
  askClaude,
  extractJson,
  getModel,
  unexpectedAnswer,
};
