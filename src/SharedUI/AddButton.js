import React from 'react'
import { Icon, Button } from "semantic-ui-react";

export const AddButton = (props) => {
    return(
        <div style={{ paddingBottom: 10 }}>
<Button icon labelPosition="left" size="small">
  <Icon name="plus"  />
  Add
</Button>
</div>
    )

}
