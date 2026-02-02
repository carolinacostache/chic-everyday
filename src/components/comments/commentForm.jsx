import EmojiPicker from "emoji-picker-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import apiRequest from "../../utils/apiRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const addComment = async (comment) => {
  const res = await apiRequest.post("/comments", comment);
  return res.data;
};

const CommentForm = ({ id }) => {
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState("");

  const emojiButtonRef = useRef(null);
  const pickerRef = useRef(null);

  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

  const handleEmojiClick = (emoji) => {
    setDesc((prev) => prev + " " + emoji.emoji);
    setOpen(false);
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      setDesc("");
      setOpen(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    mutation.mutate({
      description: desc,
      pin: id,
    });
  };

  const togglePicker = () => {
    if (!open) {
      const rect = emojiButtonRef.current.getBoundingClientRect();
      setPickerPosition({
        top: rect.top + window.scrollY - 430,
        left: rect.left + window.scrollX - 300,
      });
    }

    setOpen((prev) => !prev);
  };

    useEffect(() => {
      if(!open) {
        return;
      }

    const handleClickOutside = (event) => {
      const isOutsideButton =
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target);

      const isOutsidePicker =
        pickerRef.current && 
        !pickerRef.current.contains(event.target);

      if (isOutsideButton && isOutsidePicker) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, pickerRef, emojiButtonRef]);


  

  return (
    <>
    <form className="commentForm" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Add a comment"
        onChange={(e) => setDesc(e.target.value)}
        value={desc}
      />
      <div className="emoji">
        <div onClick={togglePicker} ref={emojiButtonRef}>😊</div>
      </div>
    </form>
      {open && createPortal(
        <div 
          className="emojiPicker"
          ref={pickerRef}
          style={{
            position: 'absolute',
            top: `${pickerPosition.top}px`,
            left: `${pickerPosition.left}px`,
            zIndex: 1000,
          }}
        >
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>,
        document.getElementById("portal-root")
      )}
    </>
  );
};

export default CommentForm;