import './createPage.css';
import NImage from '../../components/image/image';
import useAuthStore from "../../utils/authStore";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Editor from "../../components/editor/editor";
import useEditorStore from "../../utils/editorStore";
import apiRequest from "../../utils/apiRequest";
import { useMutation, useQuery } from "@tanstack/react-query";
import BoardForm from "./BoardForm";


/* nu mai e nevoie de ele aici, sunt preluate din backend
const weatherTags = [
  "rainy", "sunny", "winter", "summer", "cloudy", "foggy"
];
*/

const addPost = async (post) => {
  const res = await apiRequest.post("/pins", post);
  return res.data;
};

const CreatePage = () => {
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const formRef = useRef();
  const { textOptions, canvasOptions, resetStore } = useEditorStore();

  const [file, setFile] = useState(null);
  const [previewImg, setPreviewImg] = useState({
    url: "",
    width: 0,
    height: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  
  const [selectedBoard, setSelectedBoard] = useState("");
  const [newBoardTitle, setNewBoardTitle] = useState("");

  const [isNewBoardOpen, setIsNewBoardOpen] = useState(false);
  const [selectedWeatherTags, setSelectedWeatherTags] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth");
    }
  }, [navigate, currentUser]);

  useEffect(() => {
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        setPreviewImg({
          url: URL.createObjectURL(file),
          width: img.width,
          height: img.height,
        });
      };
    }
  }, [file]);

  const { data: tagsData, isLoading: loadingTags } = useQuery({
    queryKey: ["weatherTags"],
    queryFn: () => apiRequest.get("/pins/tags").then((res) => res.data),
  });

  const weatherTags = tagsData?.weatherTags || [];

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["formBoards", currentUser?._id],
    queryFn: () => apiRequest.get(`/boards/${currentUser._id}`).then((res) => res.data),
    enabled: !!currentUser?._id, 
  });

  const { mutate, isPending: isPublishing } = useMutation({
    mutationFn: addPost,
    onSuccess: (data) => {
      resetStore();
      navigate(`/pin/${data._id}`);
    },
    onError: (err) => {
      alert("Publicarea a eșuat: " + err.response?.data?.message);
    }
  });

  const handleSubmit = async () => {
    if (isPublishing) return;

    if (isEditing) {
      setIsEditing(false); 
      return; 
    }

    if (!file) {
      alert("Please upload a file before publishing.");
      return;
    }
    
    const formData = new FormData(formRef.current);
    const title = formData.get("title");
    const description = formData.get("description");
    const customTagsString = formData.get("customTags"); 

    if (!title || !description) {
      alert("Please fill out the Title and Description fields.");
      return;
    }

    if (selectedWeatherTags.length === 0) {
      alert("Vă rugăm selectați cel puțin un tag de vreme.");
      return;
    }

    if (isEditing) {
      setIsEditing(false);
    } else {
      const customTagsArray = customTagsString 
        ? customTagsString.split(",").map(t => t.trim()) 
        : [];
      const allTags = [...selectedWeatherTags, ...customTagsArray];

      formData.append("media", file);
      formData.append("textOptions", JSON.stringify(textOptions));
      formData.append("canvasOptions", JSON.stringify(canvasOptions));
      formData.append("tags", allTags.join(',')); 
      formData.delete("customTags"); 

      formData.append("width", previewImg.width);
      formData.append("height", previewImg.height);
      
      if (selectedBoard) {
        formData.append("board", selectedBoard); 
      } else if (newBoardTitle) {
        formData.append("newBoard", newBoardTitle);
      }
      
      mutate(formData);
    }
  };



  const handleNewBoard = () => {
    setIsNewBoardOpen((prev) => !prev);
  };

  const handleWeatherTagChange = (tagName) => {
    setSelectedWeatherTags((prevTags) => {
      if (prevTags.includes(tagName)) {
        return prevTags.filter((t) => t !== tagName);
      } else {
        return [...prevTags, tagName];
      }
    });
  };

  return (
    <div className={`createPage ${isPublishing ? 'isLoading' : ''}`}>
      
      {isPublishing && (
        <div className="loadingOverlay">
          <div className="spinner"></div>
          <span>Se publică pin-ul...</span>
        </div>
      )}

      <div className="createTop">
        <h1>{isEditing ? "Design your Pin" : "Create Pin"}</h1>
        <button onClick={handleSubmit} disabled={isPublishing}>
          {isEditing ? "Done" : "Publish"}
        </button>
      </div>
      {isEditing ? (
        <Editor previewImg={previewImg} />
      ) : (
        <div className="createBottom">
          {previewImg.url ? (
// Înlocuiește div-ul .preview existent cu acesta:

<div 
      className="preview" 
      style={{ 
        position: 'relative', 
        width: '375px', // Fixăm lățimea pentru a se potrivi cu coordonatele editorului
        margin: '0 auto' // Centrăm imaginea
      }}
    >
      <img src={previewImg.url} alt="" style={{ width: '100%' }} />
      
      {/* Afișăm textul suprapus, citind din textOptions */}
      {textOptions && textOptions.text && (
        <div
          style={{
            position: "absolute",
            left: textOptions.left,
            top: textOptions.top,
            fontSize: `${textOptions.fontSize}px`,
            color: textOptions.color,
            pointerEvents: "none", // Să nu blocheze click-urile
            userSelect: "none",
            whiteSpace: "nowrap"
          }}
        >
          {textOptions.text}
        </div>
      )}

      <div className="editIcon" onClick={() => setIsEditing(true)}>
        <NImage src="/general/edit.svg" alt="Editează imaginea" />
      </div>
    </div>
      
          ) : (
            <>
              <label htmlFor="file" className="upload">
                <div className="uploadTitle">
                  <NImage src="/general/upload.svg" alt="Încarcă fișier" />
                  <span>Choose a file</span>
                </div>
                <div className="uploadInfo">
                  We recommend using high quality .jpg files...
                </div>
              </label>
              <input
                type="file"
                id="file"
                hidden
                onChange={(e) => setFile(e.target.files[0])}
              />
            </>
          )}
          
          <form className="createForm" ref={formRef}>
            
            <div className="createFormItem">
              <label htmlFor="title">Title</label>
              <input type="text" placeholder="Add a title" name="title" id="title" />
            </div>
            
            <div className="createFormItem">
              <label htmlFor="description">Description</label>
              <textarea rows={6} type="text" placeholder="Add a detailed description" name="description" id="description" />
            </div>
            
            <div className="createFormItem">
              <label htmlFor="link">Link</label>
              <input type="text" placeholder="Add a link" name="link" id="link" />
            </div>
            
            <div className="createFormItem">
              <label htmlFor="board">Board (Opțional)</label>
              {isPending && <p>Loading boards...</p>}
              {error && <p>Could not load boards.</p>}
              {data && (
                <>
                  <select 
                    id="board" 
                    value={selectedBoard} 
                    onChange={(e) => {
                      setSelectedBoard(e.target.value);
                      setNewBoardTitle(""); 
                    }}
                    disabled={!!newBoardTitle} 
                  >
                    <option value="">Alege un board existent...</option>
                    {data.map((board) => (
                      <option value={board._id} key={board._id}>
                        {board.title}
                      </option>
                    ))}
                  </select>
                  <div className="newBoard">
                    {newBoardTitle && (
                      <div className="newBoardContainer">
                        <div className="newBoardItem">{newBoardTitle}</div>
                      </div>
                    )}
                    <div className="createBoardButton" onClick={handleNewBoard}>
                      {newBoardTitle ? "Anulează" : "Creează board nou"}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="createFormItem">
              <label htmlFor="weatherTags">Tag-uri de Vreme (Obligatoriu)</label>
              <div className="tagContainer">
                {loadingTags ? (
                  <p style={{fontSize: "14px", color: "gray"}}>Se încarcă tag-urile...</p>
                ) : (
                  weatherTags.map((tagObj) => (
                    <div 
                      key={tagObj._id} 
                      className={`tagItem ${selectedWeatherTags.includes(tagObj.name) ? "selected" : ""}`}
                      onClick={() => handleWeatherTagChange(tagObj.name)}
                    >
                      {tagObj.name}
                    </div>
                  ))
                )}
              </div>
              <small>Selectați cel puțin un tag de vreme.</small>
            </div>
            
            <div className="createFormItem">
              <label htmlFor="customTags">Tag-uri personalizate (Opțional)</label>
              <input 
                type="text" 
                placeholder="Adaugă tag-uri separate prin virgulă (ex: design, art)" 
                name="customTags" 
                id="customTags" 
              />
              <small>Oamenii nu vor vedea tag-urile tale personalizate.</small>
            </div>
          </form>

          {isNewBoardOpen && (
            <BoardForm
              setIsNewBoardOpen={setIsNewBoardOpen}
              setNewBoard={setNewBoardTitle} 
              setSelectedBoard={setSelectedBoard}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CreatePage;