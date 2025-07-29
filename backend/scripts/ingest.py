# this works on a singular source file, it checks the type of spreadsheet data and builds an INSERT query, then executes it

import fnmatch
import argparse
import openpyxl

# arg parser
parser = argparse.ArgumentParser(description="spreadsheet file to db")
parser.add_argument('f', help='the file to ingest')

args = parser.parse_args()
filename = args.f


# assumptions
# the data starts at row 11
# the data ends once a row has any empty columns A-L

# prepare indexes according to stylesheet type
# gynecologists, dentists and general practitioners
if fnmatch.fnmatch(filename, 'GIN_ZO*') or fnmatch.fnmatch(filename, 'ZOB_ZO*') or fnmatch.fnmatch(filename, 'SA_ZO*'):
    provider_index = [0, 1, 2, 3, 4] # enota, sifra_iz, naziv_iz, ulica, kraj
    spec_index = [7, 8] # sifra_de, naziv_de
    doctor_index = [5, 6, 7, 1] # sifra_zd, ime, sifra_de, sifra_iz
    schedule_index = [5, 9, 10, 11] # sifra_zd, sprejem, obseg, kolicnik (datum added separately)

    # provider data ingest
    
    # spec ingest

    # doctor ingest

    # doctor schedule ingest

# additional providers
elif fnmatch.fnmatch(filename, 'SA_ZO_DADM*'):
    provider_index = [0, 1, 2, 3, 4]
    spec_index = [5, 6]

    # provider data ingest
    
    # spec ingest

else:
    print("ingest job failed, invalid filename")



# selecting table

