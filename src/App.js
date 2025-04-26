import React from "react";
import AIDesignPage from "./pages/AIDesignPage";
// import HtmlPage from './pages/HtmlPage.jsx';
import { StorageImage } from '@aws-amplify/ui-react-storage';



function App() {
  return (
    <>
      <StorageImage
        alt="Example Image"
        path="https://s3.us-west-2.amazonaws.com/generate.imagenfile/uploads/b44537a5-9742-4f09-93e0-a4cd17d35317.jpg"
      />
      <AIDesignPage />
      {/* <HtmlPage /> */}
    </>
  );
}

export default App;
