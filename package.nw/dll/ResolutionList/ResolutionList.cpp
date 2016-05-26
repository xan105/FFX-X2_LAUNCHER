#include <stdio.h>
#include "stdafx.h"
#include "videomod.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#endif

typedef struct {
	int width;
	int height;
}resolution;

extern "C"
{
	__declspec(dllexport) void GetResolutionList(resolution table[])
	{
		CAvailableVideoModes modes;
		if (CVideoModes::GetAvailableVideoModes(modes))
		{
			for (int i = 0; i < modes.GetSize(); i++)
			{
				CVideoMode mode = modes.GetAt(i);
				table[i].width = mode.m_dwWidth;
				table[i].height = mode.m_dwHeight;
			}

		}
	}

}