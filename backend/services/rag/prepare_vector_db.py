import shutil
import os
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

loader = TextLoader(r"D:\AI\face_care_system\RAG_skin.txt", encoding="utf-8")
documents = loader.load()

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

docs = splitter.split_documents(documents)

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


if os.path.exists("vector_store"):
    shutil.rmtree("vector_store")
vector_db = FAISS.from_documents(docs, embedding_model)
vector_db.save_local("vector_store")

print("Vector DB built!")
