import React from "react";
import { AnnouncementDetailView } from "./AnnouncementDetailView"
import "./style.css";

export const AnnouncementDetailFrame = ({match}) => (  

      <div className="PolicyFrame">
        <div className="ManagePolicy">
      

       
         <AnnouncementDetailView announcementID={match.params.id}/>
        </div>
      </div>
    );
 
