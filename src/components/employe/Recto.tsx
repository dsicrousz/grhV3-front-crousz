import type { Employe } from "@/types/employe";
import { Document,Font,Image,Page, StyleSheet, Text, View,Svg,Path } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
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
    opacity:0.8
  },
});





function Recto({user}: {user: Partial<Employe>}) {
  return (
    <Document>
    <Page size={[285, 175]} style={tw('flex')} >
    <Image src="/bg.png" style={styles.pageBackground} />
          <View style={tw('flex flex-row justify-between p-2')}>
              <Image src="/logo.png" style={tw('w-16 h-16')} />
              <View style={tw("flex flex-col items-center")}>
                <View>
                  <Text style={{fontFamily:'Bebas Neue',fontSize:'10px'}}> République du Sénégal</Text>
                </View>
                <View  style={tw('font-semibold')}>
                <Text style={{fontFamily:'Bebas Neue',fontSize:'8px'}}> Un peuple - Un but - Une foi</Text>
              </View>
              <View  style={tw("text-center font-semibold")}>
                <Text style={{fontFamily:'Bebas Neue',fontSize:'7px',textAlign:"center"}}>Ministère de l'Enseignement Supérieur, de la Recherche et de
                l'Innovation </Text> 
              </View>
              <View  style={tw('flex flex-col items-center justify-center')} >
              <Text style={{fontFamily:'Bebas Neue',fontSize:'8px',textAlign:'center'}}>Centre Régional des Oeuvres Universitaires Sociales de
                Ziguinchor </Text>
                <Text style={{fontFamily:'Bebas Neue',fontSize:'8px',textAlign:'center'}}>(CROUS/Z)</Text>  
              </View>
             </View>
              <Image src="/sceau1.png" style={tw('w-16 h-16')}/>
        </View>
        <View style={tw('flex flex-row items-center justify-center')}>
          <Text style={{fontFamily:'Bebas Neue',fontSize:'24px',textAlign:"center",color:'green'}}>CARTE PROFESSIONNELLE</Text>
        </View>
        <View style={tw("flex flex-row mx-auto w-10/12")}>
            <Image
              src={`${import.meta.env.VITE_BACKURL}/uploads/profiles/${user?.profile}`}
              style={tw('rounded-full object-center object-cover h-24 w-24 m-2')}
            />

            <View style={tw('flex flex-col')}>
              <View>
               <Text style={{fontFamily:'Bebas Neue',fontSize:'18px',textAlign:'center'}}>{`${user?.prenom} ${user?.nom}`}</Text>
              </View>
              <View style={{width:'60%'}}>
            <Text style={{fontFamily:'Bebas Neue',fontSize:'10px',textAlign:'left'}}>{user?.poste}</Text>
                {/* <Text style={{fontFamily:'Bebas Neue',fontSize:'10px',textAlign:'left'}}>Partenariat et de la coopération</Text> */}
              </View>
              <View>
                <Text style={{fontFamily:'Bebas Neue',fontSize:'8px',textAlign:'left'}}>{`MAT SOLDE : ${user?.matricule_de_solde}`}</Text>
              </View>
            </View>
          </View>
          <View style={tw("flex flex-row justify-end items-center pr-6 -mt-10")}>
            <View style={tw("flex flex-col items-center justify-center")}>
              <View style={tw('flex flex-row items-center')}>
              <Svg
                      viewBox="0 0 448 512"
                      fill="#2290f0"
                      height="10"
                      width="10"
                      
                    >
                      <Path d="M64 32C28.7 32 0 60.7 0 96v320c0 35.3 28.7 64 64 64h320c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm90.7 96.7c9.7-2.6 19.9 2.3 23.7 11.6l20 48c3.4 8.2 1 17.6-5.8 23.2L168 231.7c16.6 35.2 45.1 63.7 80.3 80.3l20.2-24.7c5.6-6.8 15-9.2 23.2-5.8l48 20c9.3 3.9 14.2 14 11.6 23.7l-12 44C336.9 378 329 384 320 384 196.3 384 96 283.7 96 160c0-9 6-16.9 14.7-19.3l44-12z" />
                    </Svg>
               <Text style={{fontSize:'8px',textAlign:'center'}}> {user?.telephone}</Text> 
              </View>
              <View style={tw('flex flex-row items-center')}>
                      <Svg
              viewBox="0 0 24 24"
              fill="#2290f0"
              height="10"
              width="10"
            >
              <Path d="M17.657 5.304c-3.124-3.073-8.189-3.073-11.313 0a7.78 7.78 0 000 11.13L12 21.999l5.657-5.565a7.78 7.78 0 000-11.13zM12 13.499c-.668 0-1.295-.26-1.768-.732a2.503 2.503 0 010-3.536c.472-.472 1.1-.732 1.768-.732s1.296.26 1.768.732a2.503 2.503 0 010 3.536c-.472.472-1.1.732-1.768.732z" />
            </Svg>
               <Text style={{fontSize:'8px',textAlign:'center'}}>{user?.adresse}</Text> 
              </View>
            </View>
          </View>
    </Page>
   
  </Document>
  )
}

export default Recto