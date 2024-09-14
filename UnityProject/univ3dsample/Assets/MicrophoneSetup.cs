using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class MicrophoneSetup : MonoBehaviour
{

    AudioClip microphoneInput;
    bool microphoneInitialized;
    public float sensitivity;
    public bool flapped;

    // Start is called before the first frame update
    void Start()
    {
        if (Microphone.devices.Length>0){
		microphoneInput = Microphone.Start(Microphone.devices[0],true,999,44100);
		microphoneInitialized = true;
	}
        
    }

    // Update is called once per frame
    void Update()
    {
        //get mic volume
	int dec = 128;
	float[] waveData = new float[dec];
	int micPosition = Microphone.GetPosition(null)-(dec+1); // null means the first microphone
	microphoneInput.GetData(waveData, micPosition);
	
	// Getting a peak on the last 128 samples
	float levelMax = 0;
	for (int i = 0; i < dec; i++) {
		float wavePeak = waveData[i] * waveData[i];
		if (levelMax < wavePeak) {
			levelMax = wavePeak;
		}
	}
	
	}
}
