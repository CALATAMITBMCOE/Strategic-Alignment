Atualização do STRAT_MEAS_PER para base Demo


	UPDATE ODF_CA_STRAT_KPI 
      set Strat_Meas_Per='Y'
      where exists (select 'x'
			from ODF_CA_STRAT_KPI_MEASURE SKM	
				Where  SKM.ODF_PARENT_ID = ODF_CA_STRAT_KPI.ID
				AND SKM.MEASUREMENT_DATE = (SELECT MAX(SKM2.MEASUREMENT_DATE) 
                                    FROM ODF_CA_STRAT_KPI_MEASURE SKM2
                                    WHERE SKM2.ODF_PARENT_ID = ODF_CA_STRAT_KPI.ID
                                    AND SKM2.MEASUREMENT_DATE <= sysdate)
        AND SKM.NAME='2014')
		AND ODF_CA_STRAT_KPI.Next_measure_date is null


		UPDATE ODF_CA_STRAT_KPI 
      set Strat_Meas_Per='Q'
      where exists (select 'x'
			from ODF_CA_STRAT_KPI_MEASURE SKM	
				Where  SKM.ODF_PARENT_ID = ODF_CA_STRAT_KPI.ID
				AND SKM.MEASUREMENT_DATE = (SELECT MAX(SKM2.MEASUREMENT_DATE) 
                                    FROM ODF_CA_STRAT_KPI_MEASURE SKM2
                                    WHERE SKM2.ODF_PARENT_ID = ODF_CA_STRAT_KPI.ID
                                    AND SKM2.MEASUREMENT_DATE <= sysdate)
        AND SKM.NAME like '2014-Q%')
		AND ODF_CA_STRAT_KPI.Next_measure_date is null

		UPDATE ODF_CA_STRAT_KPI 
      set Strat_Meas_Per='M'
      where exists (select 'x'
			from ODF_CA_STRAT_KPI_MEASURE SKM	
				Where  SKM.ODF_PARENT_ID = ODF_CA_STRAT_KPI.ID
				AND SKM.MEASUREMENT_DATE = (SELECT MAX(SKM2.MEASUREMENT_DATE) 
                                    FROM ODF_CA_STRAT_KPI_MEASURE SKM2
                                    WHERE SKM2.ODF_PARENT_ID = ODF_CA_STRAT_KPI.ID
                                    AND SKM2.MEASUREMENT_DATE <= sysdate)
        AND SKM.NAME='2014-Dec')
		AND ODF_CA_STRAT_KPI.Next_measure_date is null   