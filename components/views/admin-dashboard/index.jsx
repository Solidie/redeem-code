import React from "react";
import {createRoot} from 'react-dom/client';
import {HashRouter, Routes, Route, Navigate} from 'react-router-dom';

import {MountPoint} from 'solidie-materials/mountpoint.jsx';
import {getElementDataSet} from 'solidie-materials/helpers.jsx';

import { ScreenCodes } from "./screens/codes";

export function RouteParent(props) {
	return <HashRouter>
		<Routes>
			<Route path={`/codes/:product_id?/:variation_id?/`} element={<ScreenCodes {...props}/>}/>
			<Route path={'*'} element={<Navigate to="/codes/" replace />} />
		</Routes>
	</HashRouter>
}

const element = document.getElementById('redeem_codes_dashboard');
if ( element ) {
	createRoot(element).render(
		<MountPoint>
			<RouteParent {...getElementDataSet(element)}/>
		</MountPoint>
	)
}
