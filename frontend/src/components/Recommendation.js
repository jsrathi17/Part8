import React, { useState, useEffect } from "react";
import { useQuery, useLazyQuery } from "@apollo/client";
import { ALL_BOOKS, ME } from "../queries";

const Recommendation = (props) => {
  const [books, setBooks] = useState([]);
  const resultUser = useQuery(ME);
  const [getBooks, result] = useLazyQuery(ALL_BOOKS);

  useEffect(() => {
      if(resultUser.data){
        getBooks({ variables: { genre: resultUser.data.me.favoriteGenre } });
      } 
  }, [getBooks, resultUser.data]);

  useEffect(() => {
    if(result.data){
      setBooks(result.data.allBooks)
      console.log(books);
    }
  }, [result.data]);


  if (!props.show) {
    return null
  }

  if (result.loading)  {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>Recommendations</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map(book => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommendation;