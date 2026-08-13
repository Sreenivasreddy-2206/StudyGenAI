import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { api } from "../services/api";


// =========================================================
// AUTH CONTEXT
// =========================================================

const AuthContext = createContext(null);


// =========================================================
// AUTH PROVIDER
// =========================================================

export const AuthProvider = ({ children }) => {

  console.log("AUTH PROVIDER RENDERED");


  // =======================================================
  // AUTH STATE
  // =======================================================

  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    () =>
      localStorage.getItem("studygen_token") || null
  );

  const [loading, setLoading] = useState(true);


  // =======================================================
  // DOCUMENT STATE
  // =======================================================

  const [documents, setDocuments] = useState([]);

  const [currentDocument, setCurrentDocument] =
    useState(null);


  // =======================================================
  // FETCH USER DOCUMENTS
  // =======================================================

  const fetchUserDocuments = useCallback(
    async () => {

      console.log("FETCHING USER DOCUMENTS...");

      try {

        const data =
          await api.getDocuments();

        console.log(
          "DOCUMENT RESPONSE:",
          data
        );


        const docList =
          Array.isArray(data)
            ? data
            : data.documents || [];


        setDocuments(docList);

        console.log(
          "DOCUMENTS STORED IN STATE:",
          docList
        );


        return docList;

      } catch (err) {

        console.error(
          "Could not fetch user documents:",
          err
        );

        //setDocuments([]);

        return [];

      }

    },
    []
  );


  // =======================================================
  // INITIALIZE SESSION
  // =======================================================

  useEffect(() => {

    const initAuth = async () => {

      console.log(
        "INITIALIZING AUTH SESSION..."
      );


      const storedToken =
        localStorage.getItem(
          "studygen_token"
        );


      console.log(
        "STORED TOKEN:",
        storedToken
      );


      // ---------------------------------------------------
      // NO EXISTING SESSION
      // ---------------------------------------------------

      if (!storedToken) {

        console.log(
          "NO EXISTING TOKEN"
        );

        setLoading(false);

        return;

      }


      try {

        // -------------------------------------------------
        // VERIFY JWT
        // -------------------------------------------------

        console.log(
          "VERIFYING CURRENT USER..."
        );


        const userData =
          await api.getCurrentUser();


        console.log(
          "CURRENT USER RESPONSE:",
          userData
        );


        const activeUser =
          userData.user || userData;


        setUser(activeUser);

        setToken(storedToken);


        // -------------------------------------------------
        // RESTORE USER DOCUMENTS
        // -------------------------------------------------

        console.log(
          "RESTORING USER DOCUMENTS..."
        );


        await fetchUserDocuments();


        console.log(
          "DOCUMENT RESTORATION FINISHED"
        );

      } catch (err) {

        console.warn(
          "Session verification failed:",
          err.message
        );


        // -------------------------------------------------
        // INVALID SESSION
        // -------------------------------------------------

        localStorage.removeItem(
          "studygen_token"
        );


        setUser(null);

        setToken(null);

        setDocuments([]);

        setCurrentDocument(null);

      } finally {

        setLoading(false);

      }

    };


    initAuth();

  }, [fetchUserDocuments]);


  // =======================================================
  // LOGIN
  // =======================================================

  const login = async (
    email,
    password
  ) => {

    console.log(
      "LOGIN FUNCTION CALLED"
    );


    // -----------------------------------------------------
    // LOGIN REQUEST
    // -----------------------------------------------------

    const res =
      await api.loginUser({
        email,
        password,
      });


    console.log(
      "LOGIN RESPONSE:",
      res
    );


    const accessToken =
      res.access_token;


    const userData =
      res.user || {
        email,
        name:
          email.split("@")[0],
      };


    // -----------------------------------------------------
    // CHECK TOKEN
    // -----------------------------------------------------

    if (!accessToken) {

      throw new Error(
        "Server response missing access_token"
      );

    }


    // -----------------------------------------------------
    // SAVE JWT
    // -----------------------------------------------------

    console.log(
      "SAVING LOGIN TOKEN..."
    );


    localStorage.setItem(
      "studygen_token",
      accessToken
    );


    console.log(
      "TOKEN AFTER SAVE:",
      localStorage.getItem(
        "studygen_token"
      )
    );


    setToken(accessToken);

    setUser(userData);


    // -----------------------------------------------------
    // RESTORE DOCUMENTS
    // -----------------------------------------------------

    console.log(
      "ABOUT TO FETCH DOCUMENTS AFTER LOGIN..."
    );


    await fetchUserDocuments();


    console.log(
      "DOCUMENT FETCH AFTER LOGIN FINISHED"
    );


    return res;

  };


  // =======================================================
  // REGISTER
  // =======================================================

  const register = async (
    name,
    email,
    password
  ) => {

    console.log(
      "REGISTER FUNCTION CALLED"
    );


    const res =
      await api.registerUser({
        name,
        email,
        password,
      });


    console.log(
      "REGISTER RESPONSE:",
      res
    );


    const accessToken =
      res.access_token;


    const userData =
      res.user || {
        name,
        email,
      };


    // -----------------------------------------------------
    // AUTOMATIC LOGIN
    // -----------------------------------------------------

    if (accessToken) {

      console.log(
        "SAVING REGISTRATION TOKEN..."
      );


      localStorage.setItem(
        "studygen_token",
        accessToken
      );


      console.log(
        "TOKEN AFTER REGISTER:",
        localStorage.getItem(
          "studygen_token"
        )
      );


      setToken(accessToken);

      setUser(userData);


      // ---------------------------------------------------
      // RESTORE DOCUMENTS
      // ---------------------------------------------------

      console.log(
        "ABOUT TO FETCH DOCUMENTS AFTER REGISTER..."
      );


      await fetchUserDocuments();


      console.log(
        "DOCUMENT FETCH AFTER REGISTER FINISHED"
      );

    }


    return res;

  };


  // =======================================================
  // LOGOUT
  // =======================================================

  const logout = () => {

    console.log(
      "LOGGING OUT..."
    );


    // -----------------------------------------------------
    // Remove only local session
    //
    // MongoDB documents and conversations remain untouched.
    // -----------------------------------------------------

    localStorage.removeItem(
      "studygen_token"
    );


    setUser(null);

    setToken(null);

    setDocuments([]);

    setCurrentDocument(null);

  };


  // =======================================================
  // ADD DOCUMENT
  // =======================================================

  const addDocument = (docData) => {

    console.log(
      "ADDING DOCUMENT:",
      docData
    );


    setDocuments(
      (previousDocuments) => {

        const exists =
          previousDocuments.some(
            (doc) =>
              doc.document_id ===
              docData.document_id
          );


        if (exists) {

          return previousDocuments;

        }


        return [
          docData,
          ...previousDocuments,
        ];

      }
    );


    // Automatically select uploaded document

    setCurrentDocument(
      docData
    );

  };


  // =======================================================
  // DELETE DOCUMENT
  // =======================================================

  const removeDocument = async (
    document_id
  ) => {

    if (!document_id) {

      throw new Error(
        "Document ID is required."
      );

    }


    console.log(
      "DELETING DOCUMENT:",
      document_id
    );


    // -----------------------------------------------------
    // DELETE FROM BACKEND
    // -----------------------------------------------------

    await api.deleteDocument(
      document_id
    );


    // -----------------------------------------------------
    // UPDATE LOCAL DOCUMENT STATE
    // -----------------------------------------------------

    setDocuments(
      (previousDocuments) =>
        previousDocuments.filter(
          (doc) =>
            doc.document_id !==
            document_id
        )
    );


    // -----------------------------------------------------
    // CLEAR CURRENT DOCUMENT IF DELETED
    // -----------------------------------------------------

    setCurrentDocument(
      (previousDocument) => {

        if (
          previousDocument?.document_id ===
          document_id
        ) {

          return null;

        }


        return previousDocument;

      }
    );

  };


  // =======================================================
  // CONTEXT VALUE
  // =======================================================

  const value = {

    // Authentication

    user,

    token,

    isAuthenticated:
      !!token && !!user,

    loading,

    login,

    register,

    logout,


    // Documents

    documents,

    currentDocument,

    setCurrentDocument,

    addDocument,

    removeDocument,

    fetchUserDocuments,

  };


  // =======================================================
  // PROVIDER
  // =======================================================

  return (

    <AuthContext.Provider
      value={value}
    >

      {children}

    </AuthContext.Provider>

  );

};


// =========================================================
// USE AUTH
// =========================================================

export const useAuth = () => {

  const context =
    useContext(AuthContext);


  if (!context) {

    throw new Error(
      "useAuth must be used within AuthProvider"
    );

  }


  return context;

};