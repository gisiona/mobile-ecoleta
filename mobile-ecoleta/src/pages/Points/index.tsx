import React, { useState, useEffect, Fragment } from 'react';
import { View ,Image, StyleSheet, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Constants from 'expo-constants';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute  } from '@react-navigation/native';
import MapView , { Marker } from 'react-native-maps'
import {SvgUri} from 'react-native-svg';
import api from '../../services/api';

// importa todas as funçoes da lib
import * as Location from 'expo-location';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface Point {
  city: string;
  email: string;
  id: number;
  image: string;  
  latitude: number;
  longitude: number;
  nome: string;
  uf: string;
  whatsapp: string;
}

interface Params {
  uf: number;
  city: string
}

const Points = () => {

  const [items, setItems] = useState<Item[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);
  const navigation = useNavigation();

  const route = useRoute();
  console.log(route);

  const routeParams = route.params as Params;

  // recupera os items de coleta
  useEffect( () => {
    api.get("items").then(response => {
      //console.log(response.data);
      setItems(response.data);

      console.log(items.map(item => {
        item.title;
      }));
    });
  }, []);

  // recupera a localização do usuário
  useEffect(() => {
    async function loadPosition() {        
      const { status } = await Location.requestPermissionsAsync();

      if(status !== 'granted'){
        Alert.alert("Ooops...", "Precisamos de sua permisão para acessar a sua localização.");

        return;
      }

      const location = await Location.getCurrentPositionAsync();

      const { latitude, longitude } = location.coords;

      setInitialPosition([
        latitude,
        longitude
      ]);
    }

    loadPosition();
  } , []);

   // recupera os points e itens a serem exibidos
   useEffect( () => {

    console.log(selectedItems)

    api.get("points", {
      params: {
        city: "São Paulo",
        uf: routeParams.uf,
        items: selectedItems
      }
    }).then( response => {
      // console.log(response.data);
      setPoints(response.data);
      console.log(points);
    });

  }, [selectedItems]);

  function handleNavigateBack(){
    navigation.goBack();
  }

  function handleNavigateDetail(id: number){
    navigation.navigate("Detail", {point_id: id })
  }

  function handleSelectItem(id: number){
    const alreadySelected = selectedItems.findIndex( item => item === id);

    if(alreadySelected >= 0){
      const filterreditems = selectedItems.filter(item => item === id);

      setSelectedItems(filterreditems)
    }else{
      setSelectedItems([ ...selectedItems, id]);
    }
  }
  

  return (
    <Fragment>
    <View style={styles.container}>
      <TouchableOpacity onPress={handleNavigateBack}>
        <Icon name="arrow-left" size={22} color="#34cd79" />
      </TouchableOpacity>

      <Text style={styles.title}> Bem Vindo</Text>
      <Text style={styles.description}> Encontre no mapa um ponto de coleta.</Text>
      <View style={styles.mapContainer}>
        {initialPosition[0] !== 0 && (
          <MapView style={styles.map}
            loadingEnabled={initialPosition[0] === 0}
            initialRegion={{
              latitude: initialPosition[0],
              longitude: initialPosition[1],
              latitudeDelta: 0.014,
              longitudeDelta: 0.014
            }} >
              
         {points.map(point => (
            <Marker 
              key={String(point.id)}
              coordinate={{
              latitude: point.latitude,
              longitude: point.longitude }}
              onPress={() => handleNavigateDetail(point.id)}
            >
              <View style={styles.mapMarkerContainer}>
              <Image 
                style={styles.mapMarkerImage}
                // source={{ uri:"https://images.unsplash.com/photo-1552825896-8059df63a1fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" }}/>
                source={{ uri: point.image }}/>
                <Text style={styles.mapMarkerTitle}> { point.nome }</Text>
              </View>            
            </Marker>
           )) }

          </MapView>
        )}
      </View>
    </View>

    <View style={styles.itemsContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 1 }}>
        { // Serve para exibir conteudo javaScript
          items.map(item => (
            <TouchableOpacity 
              key={String(item.id)} 
              style={[
                styles.item,
                selectedItems.includes(item.id) ? styles.selectedItem: {}
              ]} 
              // esta function dentro da funtion é para evitar que ela seja executada toda vez que a pagina for aberta, pois deve ser executada somente quando o botão for precionado
              onPress={ () => handleSelectItem(item.id) }
              activeOpacity={0.6}
            >        
              <SvgUri width={42} 
                  height={42} 
                  //uri="http://localhost:3000/uploads/baterias.svg"
                  uri={item.image_url}
                  color="#34cd79"
              />
              <Text style={styles.itemTitle}> {item.title}</Text>
            </TouchableOpacity>
          ))
        }       
      

      </ScrollView>
    </View>
    </Fragment>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80, 
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 10
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});

export default Points;