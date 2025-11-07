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
  const [isNewBoardOpen, setIsNewBoardOpen] = useState(false);

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

  

  const mutation = useMutation({
    mutationFn: addPost,
    onSuccess: (data) => {
      resetStore();
      navigate(`/pin/${data._id}`);
    },
  });

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a file before publishing.");
      return;
    }

    const formData = new FormData(formRef.current);
    const title = formData.get("title");
    const description = formData.get("description");

    if (!title || !description) {
      alert("Please fill out the Title and Description fields.");
      return;
    }

    if (isEditing) {
      setIsEditing(false);
    } else {
      const formData = new FormData(formRef.current);
      formData.append("media", file);
      formData.append("textOptions", JSON.stringify(textOptions));
      formData.append("canvasOptions", JSON.stringify(canvasOptions));
      
      formData.append("newBoard", selectedBoard); 
      mutation.mutate(formData);
    }
  };

const { data, isPending, error, refetch } = useQuery({
    queryKey: ["formBoards", currentUser?._id],
    queryFn: () => apiRequest.get(`/boards/${currentUser._id}`).then((res) => res.data),
    enabled: !!currentUser?._id, 
  });


  const handleNewBoard = () => {
    setIsNewBoardOpen((prev) => !prev);
  };


  return (
    <div className="createPage">
      <div className="createTop">
        <h1>{isEditing ? "Design your Pin" : "Create Pin"}</h1>
        <button onClick={handleSubmit}>{isEditing ? "Done" : "Publish"}</button>
      </div>
      {isEditing ? (
        <Editor previewImg={previewImg} />
      ) : (
        <div className="createBottom">
          {previewImg.url ? (
            <div className="preview">
              <img src={previewImg.url} alt="" />
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
                  We recommend using high quality .jpg files less than 20 MB or
                  .mp4 files less than 200 MB.
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
              <label htmlFor="board">Board</label>
              {isPending && <p>Loading boards...</p>}
              {error && <p>Could not load boards.</p>}
              {data && (
                <>
                  <select 
                    name="board" 
                    id="board" 
                    value={selectedBoard} 
                    onChange={(e) => setSelectedBoard(e.target.value)}
                  >
                    <option value="">Choose a board</option>
                    {data.map((board) => (
                      <option value={board._id} key={board._id}>
                        {board.title}
                      </option>
                    ))}
                  </select>
                  <div className="newBoard">
                    <div className="createBoardButton" onClick={handleNewBoard}>
                      Create new board
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="createFormItem">
              <label htmlFor="tags">Tagged topics</label>
              <input type="text" placeholder="Add tags" name="tags" id="tags" />
              <small>Don&apos;t worry, people won&apos;t see your tags</small>
            </div>
          </form>
          {isNewBoardOpen && (
            <BoardForm
              setIsNewBoardOpen={setIsNewBoardOpen}
              setNewBoard={setSelectedBoard} 
              refetchBoards={refetch}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CreatePage;