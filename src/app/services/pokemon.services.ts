import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class PokeService {
    constructor(private firestore: Firestore) {}

    guardarBusquedas(pokemon: string, tipo: string, caracteristicas: string, estadisticas: string, imagen: string, opinion: string) {
        const ref = collection(this.firestore, 'busquedas');
        return addDoc(ref, {
            pokemon,
            tipo,
            caracteristicas,
            estadisticas,
            imagen,
            opinion,
            fecha: new Date()
        });
    }
}