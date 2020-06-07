import React, {useEffect, useState} from 'react';
import { View ,Image, StyleSheet, Text, ImageBackground, TouchableOpacity, ScrollView, SafeAreaView, Linking } from 'react-native';
import Constants from 'expo-constants';
import { Feather as Icon, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView , { Marker } from 'react-native-maps'
import {SvgUri} from 'react-native-svg';
import { RectButton } from 'react-native-gesture-handler';
import api from '../../services/api';
import * as MailComposer from 'expo-mail-composer'

interface Params {
  point_id: number;
}

interface DataPoint {
  point:{
    id: number;
    image: string;
    nome: string;
    email: string;
    whatsapp: string;
    latitude: number;
    longitude: number;
    city: string;
    uf: string;
  };
  items:{
    id: number;
    image: string;
    titulo: string;
    point_id: number;
    item_id: number;
  }[]
  
}

const Detail = () => {
  
  const navigation = useNavigation();
  const route = useRoute();
  console.log(route);

  const [pointItems, setPointItems] = useState<DataPoint>({} as DataPoint);

  const routeParams = route.params as Params;

  // recupera os items de um point de coleta
  useEffect( () => {
    api.get(`points/${routeParams.point_id}`).then(response => {
      console.log(response.data);
      setPointItems(response.data);
    });
  }, []);

  function handleNavigateBack(){
    navigation.goBack();
  }

  if(!pointItems.point){
    return null;
  }

  function handleSendEmail(){
    MailComposer.composeAsync({
        subject: `Interesse na coleta de resíduos: ${""}`,
        recipients: [`${pointItems.point.email}`,'gil-real@hotmail.com'],
        body: "Olá até que horas funciona a coleta de resíduos.",
    });
}

  function handleSendMessageWhatsapp(){
    Linking.openURL(`whatsapp://send?phone=${"55" + "11977373225"}&text="Olá gostaria de mais informações sobre a coleta de resíduos"`);
  }

  return(
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" size={22} color="#34cd79" />
        </TouchableOpacity>

        <Image 
              style={styles.pointImage}
        // source={{ uri:"https://images.unsplash.com/photo-1552825896-8059df63a1fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" }}/>
        source={{ uri: pointItems.point.image }}/>
        <Text style={styles.pointName}> { pointItems.point.nome} </Text>
        <Text style={styles.pointItems}> { pointItems.items.map(item => item.titulo).join(', ') } </Text>

        <View style={styles.address}>
          <Text style={styles.addressTitle}> Endereço</Text>
          <Text style={styles.addressContent}> { pointItems.point.city }, { pointItems.point.uf } </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={ handleSendMessageWhatsapp}>
          <FontAwesome name="whatsapp" size={22} color="#fff" />
          <Text style={styles.buttonText}> WhatsApp </Text>
        </RectButton>

        <RectButton style={styles.button} onPress={ handleSendEmail }>
          <Icon name="mail" size={22} color="#fff" />
          <Text style={styles.buttonText}> E-mail </Text>
        </RectButton>   

      </View>
    </SafeAreaView>
  );

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    paddingTop: 20,
  },

  pointImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 32,
  },

  pointName: {
    color: '#322153',
    fontSize: 28,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  pointItems: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    color: '#6C6C80'
  },

  address: {
    marginTop: 32,
  },
  
  addressTitle: {
    color: '#322153',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  },

  addressContent: {
    fontFamily: 'Roboto_400Regular',
    lineHeight: 24,
    marginTop: 8,
    color: '#6C6C80'
  },

  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    paddingVertical: 20,
    paddingHorizontal: 32,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  
  button: {
    width: '48%',
    backgroundColor: '#34CB79',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    marginLeft: 8,
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Roboto_500Medium',
  },
});

export default Detail;