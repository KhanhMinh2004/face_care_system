import axiosClient from "./axiosClient";

export const getChatReply = async (question) => {

  const res = await axiosClient.post("/chat", {
    question: question
  });

  return res.data.reply;
};