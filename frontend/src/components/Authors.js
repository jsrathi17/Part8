  
import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from "@apollo/client";
import { EDIT_AUTHOR, ALL_AUTHORS } from "../queries";
import Select from "react-select";

const Authors = (props) => {
  const [authors, setAuthors] = useState([]);
  const [authorToUpdate, setAuthorToUpdate] = useState(null);
  const [born, setBorn] = useState("");
  const result = useQuery(ALL_AUTHORS);
  const [ editAuthor ] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }], 
    onError: (error) => {
      props.setError(error.graphQLErrors[0].message)
    }
  });
  
  useEffect(() => {
    if(result.data){
      setAuthors(result.data.allAuthors)
    }
  }, [result.data]);

  if (result.loading)  {
    return <div>loading...</div>
  }
  if (!props.show) {
    return null
  }

  const authorSelection = authors.map((author) => {
      return { value: author.name, label: author.name 
    };
  });

  const updateBirthYear = (event) => {
    event.preventDefault();

    editAuthor({
      variables: { name: authorToUpdate.value, setBornTo: born },
    });

    setBorn("");
    setAuthorToUpdate(null);
  };

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2>Set Birthyear</h2>
      <form onSubmit={updateBirthYear}>
        <Select
          value={authorToUpdate}
          onChange={(chosenAuthor) => setAuthorToUpdate(chosenAuthor)}
          options={authorSelection}
        />
        <div>
          <input
            type="number"
            name="born"
            onChange={({ target }) => setBorn(parseInt(target.value))}
            value={born}
          />
        </div>
        <input type="submit" value="Update Author" />
      </form>

    </div>
  )
}

export default Authors
