import GalleryItem from "../galleryItem/galleryItem";
import "./gallery.css";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import apiRequest from "../../utils/apiRequest"; // <--- FOLOSEȘTE ASTA (verifică calea dacă e utils sau lib)
import Skeleton from "../skeleton/skeleton";
import Masonry from 'react-masonry-css';


const fetchPins = async ({ pageParam, search, userId, boardId, tag, type }) => {
  // Folosim apiRequest pentru a include automat cookie-urile (withCredentials: true)
  const res = await apiRequest.get(
    `/pins?cursor=${pageParam}&search=${
      search || ""
    }&userId=${userId || ""}&boardId=${boardId || ""}&tag=${tag||""}&type=${type || ""}`
  );
  return res.data;
};


// 1. Adăugăm feedType în props
const Gallery = ({ search, userId, boardId, tag , renderItem, type, feedType }) => {
  
  // 2. Determinăm tipul activ (Homepage trimite feedType, alte pagini trimit type)
  let activeType = type || feedType;
  if (activeType === "newest") {
    activeType = ""; 
  }

  const { data, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
    // 3. Punem activeType în queryKey ca să se facă refresh la schimbare
    queryKey: ["pins", search, userId, boardId, tag, activeType], 
    queryFn: ({ pageParam = 0 }) =>
      fetchPins({ pageParam, search, userId, boardId, tag, type: activeType }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  });

  const breakpointColumnsObj = {
    default: 7,
    1746: 6,
    1509: 5,
    1272: 4,
    1035: 3,
    798: 2,
    480: 1
  };

  if (status === "pending") return <Skeleton/>;
  if (status === "error") return "Something went wrong...";

  const allPins = data?.pages.flatMap((page) => page.pins) || [];

  return (

    <>{allPins.length === 0 && status === "success" && (
        <div style={{ textAlign: "center", padding: "40px", color: "#888", fontSize: "18px" }}>
           {activeType === "following" 
             ? "Nu urmărești pe nimeni încă sau prietenii tăi nu au postat nimic."
             : "Nu am găsit postări."}
        </div>
      )}
    <InfiniteScroll
      dataLength={allPins.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={<h4>Loading more pins</h4>}
    >
      <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid" 
          columnClassName="my-masonry-grid_column" 
        >
          {allPins?.map((item) => (
            <div key={item._id}>
             {renderItem ? renderItem(item) : <GalleryItem item={item} />}
          </div>
          ))}
      </Masonry>
    </InfiniteScroll>
    </>
  );
};

export default Gallery;