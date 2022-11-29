import React, { useEffect, useState } from "react";
import {
  LoginButton,
  Text,
  useSession,
  CombinedDataProvider,
  LogoutButton,
} from "@inrupt/solid-ui-react";
import { getSolidDataset, getUrlAll, getThing } from "@inrupt/solid-client";

import "./App.css";
import AddTodo from "./components/AddTodo";
import TodoList from "./components/TodoList";
import { getOrCreateTodoList } from "./utils";

const STORAGE_PREDICATE = "http://www.w3.org/ns/pim/space#storage";

const authOptions = {
  clientName: "Solid Todo App",
};

function App() {
  const { session } = useSession();
  const [todoList, setTodoList] = useState();
  const [oidcIssuer, setoidcIssuer] = useState("");


  useEffect(()=>{
    if(!session || !session.info.isLoggedIn) return;
    (async ()=>{
      const profileDataset = await getSolidDataset(session.info.webId, {
        fetch: session.fetch,
      });
      const profileThing = getThing(profileDataset, session.info.webId);
      const podsUrls = getUrlAll(profileThing, STORAGE_PREDICATE);
      const pod = podsUrls[0];
      const containerUri = `${pod}IamTesting`;
      const list = await getOrCreateTodoList(containerUri,session.fetch);
      setTodoList(list);
    })();
  },[session, session.info.isLoggedIn]);

  const handleChange = (event) => {
    setoidcIssuer(event.target.value);
  };

  return (
    <div className="app-container">
      {session.info.isLoggedIn ? (
        <CombinedDataProvider
          datasetUrl={session.info.webId}
          thingUrl={session.info.webId}
        >
          <h1>The start</h1>
          <div className="message logged-in">
            <span>You are successfully logged in as: </span>
            <Text
              properties={[
                "http://www.w3.org/2006/vcard/ns#fn",
                "http://xmlns.com/foaf/0.1/name",
              ]}
            />
            <LogoutButton />
          </div>
          <section>
          <AddTodo todoList={todoList} setTodoList={setTodoList} />
          <TodoList todoList={todoList} setTodoList={setTodoList} />
          </section>
          <h1>The End</h1>
        </CombinedDataProvider>
      ) : (
        <div className="message">
          <span>You are not logged in. </span>
          <span>
            Log in with:
            <input
              className="oidc-issuer-input"
              type="text"
              name="oidcIssuer"
              list="providers"
              value={oidcIssuer}
              onChange={handleChange}
            />
            <datalist id="providers">
              <option value="https://login.inrupt.com/"/>
              <option value="https://solidweb.org/"/>
              <option value="https://solidcommunity.net/" />
              <option value="https://inrupt.net/" />
            </datalist>
          </span>
          <LoginButton
            oidcIssuer={oidcIssuer}
            redirectUrl={window.location.href}
            authOptions={authOptions}
          />
        </div>
      )}
    </div>
  );
}

export default App;
