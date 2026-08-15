from sentence_transformers import SentenceTransformer

model = None


def get_model():

    global model

    if model is None:

        print("Loading embedding model...")

        model = SentenceTransformer(
            "all-MiniLM-L6-v2",
            device="cpu"
        )

        print("Embedding model loaded.")

    return model


def create_embeddings(chunks):

    model = get_model()

    return model.encode(
        chunks
    ).tolist()