import Board from "../models/board.model.js";
import Pin from "../models/pin.model.js";
import Save from "../models/save.model.js";

export const createBoard = async (req, res) => {
  try {
    const userId = req.userId;
    

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, isSecret, collaborators } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Board title is required" });
    }

    const newBoard = new Board({
      title,
      user: userId,
      isSecret: isSecret || false,
      collaborators: collaborators || []
    });

    await newBoard.save();

    res.status(201).json(newBoard);
  } catch (error) {
    console.error("Error creating board:", error);
    res.status(500).json({ message: "Failed to create board" });
  }
};

export const getUserBoards = async (req, res) => {
  try {
    const { userId } = req.params;
    const { pinId } = req.query;
    const currentLoggedUser = req.userId;

    const query = {
      $or: [
        { user: userId },
        { collaborators: userId }
      ]
    };

    const boards = await Board.find(query).sort({ createdAt: -1 });

    const visibleBoards = boards.filter(board => {
      if (!board.isSecret) return true;
      const isOwner = board.user.toString() === currentLoggedUser;
      const isCollab = board.collaborators.some(id => id.toString() === currentLoggedUser);
      
      return isOwner || isCollab;
    });

    let savedBoardIds = new Set();

    if (pinId) {
      const savesForThisPin = await Save.find({
        user: userId,
        pin: pinId,
      }).select("board");

      savedBoardIds = new Set(savesForThisPin.map((s) => s.board.toString()));
    }
    
    const boardsWithPinDetails = await Promise.all(
      visibleBoards.map(async (board) => {

        const createdPins = await Pin.find({ board: board._id }).select('_id');
        
        const savedPins = await Save.find({ board: board._id }).select('pin');

        const createdPinIds = createdPins.map(p => p._id.toString());
        const savedPinIds = savedPins.map(s => s.pin.toString());
        const allPinIds = [...new Set([...createdPinIds, ...savedPinIds])];
        const pinCount = allPinIds.length;

        let firstPin = null;
        if (pinCount > 0) {
          const lastSave = await Save.findOne({ board: board._id })
                                 .sort({ createdAt: -1 })
                                 .populate('pin');
          
          if(lastSave) {
             firstPin = lastSave.pin; 
          } else {
             firstPin = await Pin.findOne({ board: board._id });
          }
        }

        const isSaved = savedBoardIds.has(board._id.toString());

        return {
          ...board.toObject(),
          pinCount,
          firstPin,
          isSaved: isSaved
        };
      })
    );

    res.status(200).json(boardsWithPinDetails);
  } catch (error) {
    console.error("EROARE în getUserBoards:", error);
    res.status(500).json({ message: "Server error" });
  }
};


