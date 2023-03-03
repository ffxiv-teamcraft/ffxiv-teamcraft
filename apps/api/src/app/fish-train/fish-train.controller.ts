import { FishTrain } from '@ffxiv-teamcraft/types';
import { Body, Controller, Get, HttpException, Param, Post } from '@nestjs/common';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { credential } from 'firebase-admin';

@Controller({
  path: '/fish-train'
})
export class FishTrainController {

  app = initializeApp({
    credential: credential.applicationDefault()
  });

  firestore = getFirestore(this.app);

  @Get(':id')
  getFishTrain(@Param('id') id: string) {
    return this.firestore
      .collection('fish-train')
      .doc(id)
      .get()
      .then(doc => {
        const data = doc.data();
        return {
          start: data.start,
          fish: data.fish,
          name: data.name || '',
          conductorToken: data.conductorToken || ''
        };
      })
      .catch(err => {
        if (err.code === 7) {
          throw new HttpException(`Fish train #${id} not found`, 404);
        }
        throw err;
      });
  }

  @Post()
  createFishTrain(@Body() body: any) {
    const fishTrain: FishTrain = {
      name: body.name || '',
      conductorToken: body.conductorToken || '',
      start: new Date(body.start).getTime(),
      fish: body.fish.map(stop => {
        return {
          id: stop.id,
          start: new Date(stop.start).getTime(),
          end: new Date(stop.end).getTime()
        };
      }),
      end: new Date(body.fish[body.fish.length - 1].end).getTime(),
      passengers: []
    };
    return this.firestore
      .collection('fish-train')
      .add(fishTrain)
      .then(ref => {
        return {
          id: ref.id
        };
      });
  }
}
