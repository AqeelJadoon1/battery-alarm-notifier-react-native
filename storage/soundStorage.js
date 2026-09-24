import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_FULL = "@battery_notify/sound_full";
const KEY_THRESHOLD = "@battery_notify/sound_threshold";

function keyFor(channelType) {
  return channelType === "full" ? KEY_FULL : KEY_THRESHOLD;
}

export async function getSavedSoundUri(channelType) {
  return AsyncStorage.getItem(keyFor(channelType));
}

export async function saveSoundUriLocally(channelType, uri) {
  if (uri) {
    await AsyncStorage.setItem(keyFor(channelType), uri);
  } else {
    await AsyncStorage.removeItem(keyFor(channelType));
  }
}