import React from "react"
import {ItsLog} from "../DataExchange/PayloadBuilder"
import { log } from "../DataExchange/Up"
import { Button } from "semantic-ui-react"
import { AccountStore } from "../Stores/AccountStore"

export const AskAQuestion = (props) => {
    
    const handleClick = () => {
      log(ItsLog(true,{"event": "click", "type":"ask"}))

    }
    return(
        <div style={{paddingTop: 10}}>
        <Button basic 
            onClick={e => {
            handleClick()
            window.location.href=`mailto:${AccountStore.account.generalEmail}?subject=Re:%20${props.content.label}` 
        }}
         >Ask A Question...</Button>
        </div>
    )
}