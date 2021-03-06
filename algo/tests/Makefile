CXX?=g++
INCLUDE=-I ..
OPTIM=-g -O0 $(COVERAGE)
override CXXFLAGS += -std=c++11 -W -Wall $(OPTIM)
LDLIBS=-lz
SRC= unit-tests/tests.cpp
EXEC=$(SRC:.cpp=)
OBJ=$(SRC:.cpp=.o)
OTHER_SRC=$(wildcard unit-tests/*.cpp)
LIB=../core/vidjil.a ../lib/lib.a
SHOULD=$(wildcard should-get-tests/*.should-get) $(wildcard bugs/*.should-get)
SHOULD_LOG=$(SHOULD:.should-get=.tap)
SHOULD_VDJ_EXPECTED_FAILS=--expected-fails 81
SHOULD_LOCUS_EXPECTED_FAILS=--expected-fails 2
SHOULD_VDJ=$(wildcard should-vdj-tests/*.should-vdj.fa)
SHOULD_VDJ_VDJ=$(SHOULD_VDJ:.should-vdj.fa=.1.vdj)
SHOULD_LOCUS=$(wildcard should-vdj-tests/*.should-locus.fa)
SHOULD_VDJ_TO_TAP=python -u should-vdj-to-tap.py
REPORTS_PATH := $(patsubst %/Makefile,%,$(abspath $(lastword $(MAKEFILE_LIST))))/../../reports
VALGRIND=valgrind -v --tool=memcheck --leak-check=full --show-reachable=yes --undef-value-errors=yes --track-origins=yes --xml=yes --xml-file="$$(mktemp "$(REPORTS_PATH)/valgrind.xml.XXXXXX")"

#should-vdj that should not be published in our public curated dataset (just internal tests)
EXCLUDE_SHOULD_VDJ=bug20151006-rc.should-vdj.fa cdr3-indels.should-vdj.fa ext-nucleotides-N.should-vdj.fa segment_simul.should-vdj.fa trd-dd2-dd3.should-vdj.fa trd-dd2up-dd3down.should-vdj.fa igh-vdj.should-vdj.fa Demo-X5.should-vdj.fa
SHOULD_VDJ_ARCHIVE:=$(filter-out $(addprefix should-vdj-tests/,$(EXCLUDE_SHOULD_VDJ)), $(SHOULD_VDJ))

DATE=$(shell date +%Y-%m-%d--%H:%M:%S)
GIT_SHA1=$(shell git rev-parse --short HEAD || echo 'nogit')
SNAPSHOTS_DIR=./snapshots
SNAPSHOT=$(SNAPSHOTS_DIR)/snapshot-log--$(DATE)--$(GIT_SHA1)
SNAPSHOT_CURRENT=$(SNAPSHOT)--current

.PHONY: all force clean forcedep

test: all
	@echo
	@echo "*** Launching unit tests..."
	./unit-tests/tests
	cat ./unit-tests/tests.cpp.tap
	@echo "*** All unit tests passed"

all: core $(EXEC)
	@echo "All tests compiled."

snapshot:
	mkdir -p $(SNAPSHOTS_DIR)
	-grep --no-messages . out-*.log should-get-tests/*.log should-vdj-tests/*.log > $(SNAPSHOT)

snapshot_success: snapshot
	touch snapshot-last ; mv snapshot-last snapshot-prev
	ln -s $(SNAPSHOT) snapshot-last
	-(which diffstat && make snapshot_diff | diffstat -cC)

# Diff between the two last succeeded snasphots
snapshot_diff:
	-diff -u -I ".*20..-..-...*" snapshot-prev snapshot-last

# Diff between the last succeeded snasphot and the (possibly failed) current snapshot
snapshot_diff_current:
	-make snapshot SNAPSHOT="$(SNAPSHOT_CURRENT)"
	-diff -u -I ".*20..-..-...*" snapshot-last $(SNAPSHOT_CURRENT)

should: vidjil $(SHOULD_LOG)

shouldvdj_if_python:
	if python ../../tools/check_python_version.py ; \
	then $(MAKE) shouldlocus_and_vdj ; \
	else echo "!!! Bad python version, we skip .should-vdj.fa tests..." ; \
	fi

shouldlocus: vidjil
	$(SHOULD_VDJ_TO_TAP) -2q -r $(SHOULD_LOCUS_EXPECTED_FAILS) $(SHOULD_VDJ) $(SHOULD_LOCUS)

shouldlocus_and_vdj: vidjil
	@echo "*** Launching .should-vdj-fa tests..."
	$(MAKE) shouldlocus
	$(MAKE) shouldvdj_with_rc
	@echo "*** All .should-vdj.fa tests passed"

shouldvdj_no_relaunch:
	$(SHOULD_VDJ_TO_TAP) $(SHOULD_VDJ_EXPECTED_FAILS) $(SHOULD_VDJ_VDJ)

shouldvdj:
	$(SHOULD_VDJ_TO_TAP) $(SHOULD_VDJ_EXPECTED_FAILS) $(SHOULD_VDJ)

shouldvdj_with_rc:
	$(SHOULD_VDJ_TO_TAP) $(SHOULD_VDJ_EXPECTED_FAILS) -r $(SHOULD_VDJ)

shouldvdj_with_rc_merged:
	cat $(SHOULD_VDJ) > should-vdj-tests/should-vdj.merged.fa
	$(SHOULD_VDJ_TO_TAP) -r should-vdj-tests/should-vdj.merged.fa

# When the global test suite is passing, individual failed tests (counted in SHOULD_*_EXPECTED_FAILS)
# can be marked as 'TODO' to make continuous integration happy
mark_failed_tests_as_todo:
	-sed -e "s/^\(not ok [0-9]*\) /\1 # TODO ##/" -i".bak" */*.tap
	rm -f */*.tap.bak

curatedvdj_archive: curated-vdj.zip
curated-vdj.zip: $(SHOULD_VDJ_ARCHIVE)
	$(eval tmpdir := $(shell mktemp -d))
	mkdir $(tmpdir)/curated-vdj
	cp --preserve $(SHOULD_VDJ_ARCHIVE) $(tmpdir)/curated-vdj
	sed -r 's/\s*BUG//' -i $(tmpdir)/curated-vdj/*
	for file in $(tmpdir)/curated-vdj/*; do mv $$file `echo $$file | sed 's/should/curated/'`; done
	cwd=`pwd` && cd $(tmpdir) && zip $$cwd/$@ curated-vdj/*
	rm -rf $(tmpdir)

%.tap: %.should-get force
	./should-to-tap.sh $<

valgrind_should:
	$(MAKE) -C $(REPORTS_PATH) clean_valgrind
	LAUNCHER="$(VALGRIND)" $(MAKE) should

valgrind_%:
	LAUNCHER="$(VALGRIND)" $(MAKE) $(patsubst valgrind_%,%,$@)

valgrind_tests: vidjil ./unit-tests/tests
	$(VALGRIND) ./unit-tests/tests

$(EXEC): % : %.o $(LIB) 
	$(CXX) -o $@ $< $(LIB) $(LDLIBS) $(LDFLAGS) $(CXXFLAGS)


../%.a:
	$(MAKE) -C $(dir $@) $(notdir $@)

vidjil:
	$(MAKE) -C ../ clean
	$(MAKE) -C ../ OPTIM="$(OPTIM)"

core:
	$(MAKE) -C ../core

%.o: %.cpp $(OTHER_SRC)
	$(CXX) -o $@ $(INCLUDE) -c $< $(CXXFLAGS)

clean:
	rm -f $(OBJ) $(EXEC)
cleancoverage:
	rm -f *.gcda *.gcno *.gcov
cleantests:
	rm -f *.tap *.log should-vdj-tests/*.tap should-vdj-tests/*.log should-get-tests/*.tap should-get-tests/*.log
	rm -rf out/

cleanall: clean cleancoverage cleantests

forcedep:
	$(CXX) $(CXXFLAGS) $(INCLUDE) -M $(SRC) > dep.mk

force:

DEP=$(wildcard dep.mk)

ifeq (${DEP},)
$(shell	$(CXX) $(CXXFLAGS) $(INCLUDE) -M $(SRC) > dep.mk)
endif
include dep.mk

