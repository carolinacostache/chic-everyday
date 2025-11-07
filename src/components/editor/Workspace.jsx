import { useEffect, useRef } from "react";
import useEditorStore from "../../utils/editorStore";
import NImage from "../image/image";

const Workspace = ({ previewImg }) => {
  const {
    setSelectedLayer,
    textOptions,
    setTextOptions,
    canvasOptions,
    setCanvasOptions,
  } = useEditorStore();

  useEffect(() => {
    if (canvasOptions.height === 0) {
      const canvasHeight = (375 * previewImg.height) / previewImg.width;
      setCanvasOptions({
        ...canvasOptions,
        height: canvasHeight,
        orientation: canvasHeight > 375 ? "portrait" : "landscape",
      });
    }
  }, [previewImg, canvasOptions, setCanvasOptions]);

  const itemRef = useRef(null);
  const containerRef = useRef(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  
  const handleMouseMove = (e) => {
    if (!dragging.current) return;

    e.preventDefault(); 

    const canvasRect = containerRef.current.getBoundingClientRect();
    let newLeft = e.clientX - canvasRect.left - offset.current.x;
    let newTop = e.clientY - canvasRect.top - offset.current.y;

    const itemWidth = itemRef.current.offsetWidth;
    const itemHeight = itemRef.current.offsetHeight;

    if (newLeft < 0) newLeft = 0;
    if (newTop < 0) newTop = 0;
    if (newLeft + itemWidth > canvasRect.width) newLeft = canvasRect.width - itemWidth;
    if (newTop + itemHeight > canvasRect.height) newTop = canvasRect.height - itemHeight;


    itemRef.current.style.left = `${newLeft}px`;
    itemRef.current.style.top = `${newTop}px`;
  };

  const handleMouseUp = () => {
    if (!dragging.current) return;
    dragging.current = false;

    if(itemRef.current) {
        itemRef.current.style.cursor = "grab";
    }

    const finalLeft = parseFloat(itemRef.current.style.left);
    const finalTop = parseFloat(itemRef.current.style.top);
    
    setTextOptions({
      ...textOptions,
      left: finalLeft,
      top: finalTop,
    });
  };

  const handleMouseLeave = () => {
    if (dragging.current) {
      handleMouseUp();
    }
  };

  const handleMouseDown = (e) => {
    setSelectedLayer("text");
    dragging.current = true;

    const canvasRect = containerRef.current.getBoundingClientRect();
    const mouseXInCanvas = e.clientX - canvasRect.left;
    const mouseYInCanvas = e.clientY - canvasRect.top;

    offset.current = {
      x: mouseXInCanvas - textOptions.left,
      y: mouseYInCanvas - textOptions.top,
    };

    if(itemRef.current) {
        itemRef.current.style.cursor = "grabbing";
    }
  };

  return (
    <div className="workspace">
      <div
        className="canvas"
        style={{
          height: canvasOptions.height,
          backgroundColor: canvasOptions.backgroundColor,
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        ref={containerRef}
      >
        <img src={previewImg.url} alt="Preview" />
        {textOptions.text && (
          <div
            className="text"
            style={{
              left: textOptions.left,
              top: textOptions.top,
              fontSize: `${textOptions.fontSize}px`,
            }}
            ref={itemRef}
            onMouseDown={handleMouseDown}
          >
            <input
              type="text"
              value={textOptions.text}
              onChange={(e) =>
                setTextOptions({ ...textOptions, text: e.target.value })
              }
              style={{
                color: textOptions.color,
              }}
              onMouseDown={(e) => e.stopPropagation()}
            />
            <div
              className="deleteTextButton"
              onClick={() => setTextOptions({ ...textOptions, text: "" })}

              onMouseDown={(e) => e.stopPropagation()}
            >
              <NImage src="/general/delete.svg" alt="Delete text" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workspace;