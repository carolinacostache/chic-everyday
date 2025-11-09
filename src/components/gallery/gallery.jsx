import GalleryItem from "../galleryItem/galleryItem";
import "./gallery.css";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import Skeleton from "../skeleton/skeleton";
import Masonry from 'react-masonry-css';


const fetchPins = async ({ pageParam, search, userId, boardId, tag }) => {
  const res = await axios.get(
    `${import.meta.env.VITE_API_ENDPOINT}/pins?cursor=${pageParam}&search=${
      search || ""
    }&userId=${userId || ""}&boardId=${boardId || ""}&tag=${tag||""}`
  );
  return res.data;
};


const Gallery = ({ search, userId, boardId, tag }) => {
  const { data, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
    queryKey: ["pins", search, userId, boardId, tag],
    queryFn: ({ pageParam = 0 }) =>
      fetchPins({ pageParam, search, userId, boardId, tag }),
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
    <InfiniteScroll
      dataLength={allPins.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={<h4>Loading more pins</h4>}
      endMessage={<h3>All Posts Loaded!</h3>}
    >
      <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid" // Clasa containerului
          columnClassName="my-masonry-grid_column" // Clasa coloanei
        >
          {allPins?.map((item) => (
            <GalleryItem key={item._id} item={item} />
          ))}
      </Masonry>
    </InfiniteScroll>
  );
};

export default Gallery;