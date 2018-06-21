import {DataModel} from '../../core/database/storage/data-model';
import {ListLayout} from '../../core/layout/list-layout';
import {DeserializeAs} from '@kaiu/serializer';
import {Alarm} from '../../core/time/alarm';
import {ListDetailsFilters} from '../other/list-details-filters';
import {GearSet} from '../../pages/simulator/model/gear-set';
import {AlarmGroup} from '../other/alarm-group';

export class AppUser extends DataModel {
    name?: string;
    email?: string;
    masterbooks?: number[];
    lodestoneId?: number;
    avatar?: string;
    favorites?: string[];
    favoriteWorkshops?: string[];
    patron?: boolean;
    anonymous?: boolean;
    providerId?: string;
    patreonEmail?: string;
    // Patron-only feature, nickname internal to teamcraft, must be unique.
    nickname?: string;
    admin?: boolean;
    // List layouts are now stored inside firebase
    @DeserializeAs([ListLayout])
    layouts?: ListLayout[];
    // Alarms are now stored inside firebase
    alarms: Alarm[];
    // Default filters (#289)
    listDetailsFilters: ListDetailsFilters = ListDetailsFilters.DEFAULT;
    // List ids user has write access to
    sharedLists: string[] = [];
    // Workshop ids user has write access to
    sharedWorkshops: string[] = [];
    // Saved overriden gearsets
    gearSets: GearSet[] = [];
    // Contact ids
    contacts: string[] = [];
    // Alarm groups for the user
    alarmGroups: AlarmGroup[] = [{name: 'Default group', enabled: true}];
    // Rotation folders
    rotationFolders: string[] = [];
}
