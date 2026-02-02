import { useSearchParams } from 'react-router-dom'
import Gallery from '../../components/gallery/gallery'
import './searchPage.css'

const SearchPage = () => {

  let [searchParams]= useSearchParams()

  const search = searchParams.get("search")
  const boardId = searchParams.get("boardId")
  const tag = searchParams.get("tag")

  const title = tag || search;

  return (
    <div className="searchPageContainer">
          {title && (
            <h1 className="searchTitle">
              {tag ? "Tag: " : "Results for: "} "{title}" 
            </h1>
          )}

          <Gallery search={search} boardId={boardId} tag={tag}/>
    </div>  )
}

export default SearchPage