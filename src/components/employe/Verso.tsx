import { Document,Font,Image,Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import QRCodePage from './QrCodePage';
import dayjs from "dayjs";
Font.register({
  family: 'Bebas Neue',
  src:'/Bebas_Neue/BebasNeue-Regular.ttf'
})
const tw = createTw({
  theme: {
    fontFamily: {
      sans: ["Comic Sans"],
    },
    extend: {
      fontFamily: {
        'roboto': ['"Roboto Serif"', "serif"],
      },
    },
  },
});

const styles = StyleSheet.create({
  pageBackground: {
    position: 'absolute',
    minWidth: '100%',
    minHeight: '100%',
    height: '100%',
    width: '100%',
    opacity:0.7,
  },
});


function Verso({value}: {value: string | undefined}) {
  return (
    <Document>
    <Page size={[285, 175]} style={tw('flex')} >
    <Image src="/flag.jpg" style={styles.pageBackground} />
    <View style={{...tw("h-full flex flex-col justify-between items-center p-2")}}>
            <View style={tw("flex flex-row justify-around items-center px-8 mt-2")}>
                <View style={tw("p-2")}>
                 <Text style={{fontFamily:'Bebas Neue',fontSize:'12px',textAlign:"justify"}}> Les autorités civiles et les forces de défense sont priées de
                  bien vouloir faciliter la tâche au détenteur de cette carte
                  dans l'accomplissement de sa mission</Text> 
                </View>
              <QRCodePage value={value || ""}/>
            </View>

            <View style={tw("w-full flex flex-row justify-around items-center mt-5")}>
              <View  style={tw("self-end")}>
               <Text style={{fontFamily:'Bebas Neue',fontSize:'7px',textAlign:"center"}}> Délivrée le : {dayjs(new Date()).format("DD/MM/YYYY")}</Text> 
              </View>
              <Image src="/tampon.png" style={tw('w-28 h-28')} />
            </View>
          </View>
    </Page>
   
  </Document>
  )
}

export default Verso