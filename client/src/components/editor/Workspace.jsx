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
    if (canvasOptions.height === 0 && previewImg.width) {
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

    // Limitează mișcarea în interiorul canvas-ului
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

    if (itemRef.current) {
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
    
    // Calculează offset-ul corect față de colțul elementului
    // (Folosim getBoundingClientRect pentru elementul curent pentru precizie)
    const itemRect = itemRef.current.getBoundingClientRect();
    
    offset.current = {
      x: e.clientX - itemRect.left,
      y: e.clientY - itemRect.top,
    };

    if (itemRef.current) {
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
          position: "relative", // Asigură-te că e relativ
          overflow: "hidden" // Ascunde ce iese din cadru
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        ref={containerRef}
      >
        <img src={previewImg.url} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
        
        {textOptions.text && (
          <div
            className="text"
            style={{
              position: "absolute", // Esențial pentru drag
              left: textOptions.left,
              top: textOptions.top,
              fontSize: `${textOptions.fontSize}px`,
              cursor: "grab", // Arată mânuța
              userSelect: "none", // Previne selectarea textului în timp ce tragi
              padding: "4px", // Un pic de spațiu să fie mai ușor de prins
              border: "1px dashed transparent" // Opțional: vizual
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
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "inherit",
                fontFamily: "inherit",
                width: `${textOptions.text.length + 1}ch`, // Auto-resize aproximativ
                minWidth: "50px",
                cursor: "text"
              }}
              // --- AM ȘTERS onMouseDown AICI ---
              // Acum evenimentul se duce la părinte și începe drag-ul
            />
            <div
              className="deleteTextButton"
              onClick={() => setTextOptions({ ...textOptions, text: "" })}
              // Aici păstrăm stopPropagation ca să nu începem drag-ul când ștergem
              onMouseDown={(e) => e.stopPropagation()} 
              style={{
                  position: 'absolute', 
                  top: '-10px', 
                  right: '-10px',
                  cursor: 'pointer'
              }}
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