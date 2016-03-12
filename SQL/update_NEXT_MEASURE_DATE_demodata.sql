Atualização da NEXT_MEASURE_DATE que está nula

Update ODF_CA_STRAT_KPI 
Set Next_Measure_Date = 
  (select add_months(SKM.MEASUREMENT_DATE,1)
	from ODF_CA_STRAT_KPI_MEASURE SKM	
			Where SKM.ODF_PARENT_ID = ODF_CA_STRAT_KPI.ID
				AND SKM.MEASUREMENT_DATE = (SELECT MAX(SKM2.MEASUREMENT_DATE) 
                                    FROM ODF_CA_STRAT_KPI_MEASURE SKM2
                                    WHERE SKM2.ODF_PARENT_ID = ODF_CA_STRAT_KPI.ID
                                    AND SKM2.MEASUREMENT_DATE <= sysdate))
                                    
		where Next_measure_date is null  and Strat_Meas_Per='M'
    and exists (select 'x'
	from ODF_CA_STRAT_KPI_MEASURE SKM	
			Where SKM.ODF_PARENT_ID = ODF_CA_STRAT_KPI.ID
				AND SKM.MEASUREMENT_DATE = (SELECT MAX(SKM2.MEASUREMENT_DATE) 
                                    FROM ODF_CA_STRAT_KPI_MEASURE SKM2
                                    WHERE SKM2.ODF_PARENT_ID = ODF_CA_STRAT_KPI.ID
                                    AND SKM2.MEASUREMENT_DATE <= sysdate))
									
									
Update ODF_CA_STRAT_KPI 
Set Next_Measure_Date = 
  (select add_months(SKM.MEASUREMENT_DATE,3)
	from ODF_CA_STRAT_KPI_MEASURE SKM	
			Where SKM.ODF_PARENT_ID = ODF_CA_STRAT_KPI.ID
				AND SKM.MEASUREMENT_DATE = (SELECT MAX(SKM2.MEASUREMENT_DATE) 
                                    FROM ODF_CA_STRAT_KPI_MEASURE SKM2
                                    WHERE SKM2.ODF_PARENT_ID = ODF_CA_STRAT_KPI.ID
                                    AND SKM2.MEASUREMENT_DATE <= sysdate))
                                    
		where Next_measure_date is null  and Strat_Meas_Per='Q'
    and exists (select 'x'
	from ODF_CA_STRAT_KPI_MEASURE SKM	
			Where SKM.ODF_PARENT_ID = ODF_CA_STRAT_KPI.ID
				AND SKM.MEASUREMENT_DATE = (SELECT MAX(SKM2.MEASUREMENT_DATE) 
                                    FROM ODF_CA_STRAT_KPI_MEASURE SKM2
                                    WHERE SKM2.ODF_PARENT_ID = ODF_CA_STRAT_KPI.ID
                                    AND SKM2.MEASUREMENT_DATE <= sysdate))
									
Update ODF_CA_STRAT_KPI 
Set Next_Measure_Date = 
  (select add_months(SKM.MEASUREMENT_DATE,12)
	from ODF_CA_STRAT_KPI_MEASURE SKM	
			Where SKM.ODF_PARENT_ID = ODF_CA_STRAT_KPI.ID
				AND SKM.MEASUREMENT_DATE = (SELECT MAX(SKM2.MEASUREMENT_DATE) 
                                    FROM ODF_CA_STRAT_KPI_MEASURE SKM2
                                    WHERE SKM2.ODF_PARENT_ID = ODF_CA_STRAT_KPI.ID
                                    AND SKM2.MEASUREMENT_DATE <= sysdate))
                                    
		where Next_measure_date is null  and Strat_Meas_Per='Y'
    and exists (select 'x'
	from ODF_CA_STRAT_KPI_MEASURE SKM	
			Where SKM.ODF_PARENT_ID = ODF_CA_STRAT_KPI.ID
				AND SKM.MEASUREMENT_DATE = (SELECT MAX(SKM2.MEASUREMENT_DATE) 
                                    FROM ODF_CA_STRAT_KPI_MEASURE SKM2
                                    WHERE SKM2.ODF_PARENT_ID = ODF_CA_STRAT_KPI.ID
                                    AND SKM2.MEASUREMENT_DATE <= sysdate))									