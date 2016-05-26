/*
Module : VIDEOMOD.H
Purpose: Defines the interface to some handy classes which wrap access 
         to the EnumDisplaySettings & ChangeDisplaySettings SDK functions
Created: PJN / 24-09-1997
History: None

Copyright (c) 1997 by PJ Naughter.  
All rights reserved.

*/


///////////////////// Macros / Structs etc //////////////////////////

#ifndef __VIDEOMOD_H__
#define __VIDEOMOD_H__


#ifndef __AFXTEMPL_H__
#pragma error("This module requires afxtempl.h in your precompilled header")
#endif


/////////////////////////// Classes ///////////////////////////////

//Class wrapper for a Video Mode
class CVideoMode
{
public:
//Constructors / Destructors
  CVideoMode();
  CVideoMode(DWORD BitsPerPixel, DWORD Width, DWORD Height, DWORD Frequency);
  CVideoMode(const CVideoMode& mode);
  CVideoMode& operator=(const CVideoMode& mode);

//Public variables
  DWORD m_dwBitsPerPixel;
  DWORD m_dwWidth;
  DWORD m_dwHeight;
  DWORD m_dwFrequency;
};


//Defintion of the array which contains all available video modes
typedef CArray<CVideoMode, CVideoMode&> CAvailableVideoModes; 


//Class which contains the actual functions the developer can call
//All functions are static as the class does not contain any instance
//data. Functions which return a LONG use the same return values as from
//the SDK function ChangeDisplaySettings()
class CVideoModes
{
public:
  static BOOL GetCurrentVideoMode(CVideoMode& mode);
  static BOOL GetAvailableVideoModes(CAvailableVideoModes& modes);
  static LONG ChangeVideoModePermanently(const CVideoMode& mode);
  static LONG ChangeVideoModeTemporarily(const CVideoMode& mode);
  static LONG CanChangeVideoMode(const CVideoMode& mode);
  static LONG RevertVideoModeToDefault();

protected:
  static void ReportChangeVideoErrorValue(LONG lError);
  static void CreateCompatibleDEVMODE(DEVMODE* pdm, DWORD BitsPerPixel, DWORD Width, DWORD Height, DWORD Frequency);
};


#endif //__VIDEOMOD_H__