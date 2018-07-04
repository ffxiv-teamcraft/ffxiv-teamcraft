import {Consumable} from '../../pages/simulator/model/consumable';
import {FreeCompanyAction} from '../../pages/simulator/model/free-company-action';
import {DeserializeAs} from '@kaiu/serializer';

export class DefaultConsumables {

    @DeserializeAs(Consumable)
    food: Consumable;

    @DeserializeAs(Consumable)
    medicine: Consumable;

    @DeserializeAs([FreeCompanyAction])
    freeCompanyActions: FreeCompanyAction[];

    public constructor(food: Consumable, medicine: Consumable, freeCompanyActions: FreeCompanyAction[]) {
        this.food = food;
        this.medicine = medicine;
        this.freeCompanyActions = freeCompanyActions || [];
    }
}
