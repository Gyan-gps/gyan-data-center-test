import React from "react";

export default function Heading(props) {
  const styles= {
      fontSize: props?.backgroundColor ? "15px": "16px", 
      color: "#002F75",
      backgroundColor: props?.backgroundColor || "transparent",
      fontWeight: "400",
      textTransform: "uppercase",
      padding:"8px 8px 8px 20px",
      height:"40px",
      lineHeight:"1.1",
      fontFamily:"Avenir Roman"
    };

  if(props.subheading){ 
    return <div>
            <h2 style={{...styles,height:"30px",fontSize:"15px"}}>{props.heading}</h2>
            <h2 style={{...styles,fontSize:"13px"}}>{props.subheading}</h2>
           </div>
  }else{ 
    return <h2 style={styles}>{props.heading}</h2>;  
  }
}
