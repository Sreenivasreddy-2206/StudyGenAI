from sentence_transformers import SentenceTransformer


# =========================================================
# LAZY LOADED MODEL
# =========================================================

model = None


def get_embedding_model():

    global model

    if model is None:

        print("Loading embedding model...")

        model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )

        print("Embedding model loaded.")

    return model


# =========================================================
# CREATE EMBEDDINGS
# =========================================================

def create_embeddings(chunks):

    embedding_model = get_embedding_model()

    return embedding_model.encode(
        chunks
    ).tolist()