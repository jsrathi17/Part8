import React, { useState, useEffect } from 'react'
import { useLazyQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";

const Books = (props) => {
  const [books, setBooks] = useState([]);
  const [allBooksState, setAllbooksState] = useState([]);
  const [uniqueGenres, setUniqueGenres] = useState([]);
  const [filter, setFilter] = useState("");
  const [getBooks, result] = useLazyQuery(ALL_BOOKS);

  useEffect(() => {
    if(!filter){
      getBooks();
    }else{
      getBooks({ variables: { genre: filter } });     
    }
  }, [getBooks, filter]);

  useEffect(() => {
    if(result.data){
      setBooks(result.data.allBooks)
      if(!filter){
        setAllbooksState(result.data.allBooks)
      } 
    }
  }, [result.data]); 

  useEffect(() => {
    allBooksState.map(book =>{
      book.genres.forEach(genre => {
        if(!uniqueGenres.includes(genre)){  
          setUniqueGenres(uniqueGenres.concat(genre));  
        } 
      });
    });
  }, [allBooksState, uniqueGenres]);

  if (!props.show) {
    return null
  }

  if (result.loading)  {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      {uniqueGenres.map(genre => 
            <button id={genre} onClick={() => setFilter(genre)}>{genre}</button>
          )}
      <button onClick={() => {
        setFilter("");
        getBooks();
      }
    }>clear filter</button>
    </div>
    
  )
}

export default Books